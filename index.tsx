
import React, { useState, useMemo } from 'react';
import { createRoot } from 'react-dom/client';
import { 
  Search, 
  ChevronLeft,
  ChevronRight,
  Bell,
  Plus,
  FileSpreadsheet,
  History,
  Activity,
  ImageIcon,
  Megaphone,
  Flame,
  Import,
  Clock,
  Calendar,
  Wallet,
  CreditCard,
  FileText,
  Landmark,
  Coins,
  Receipt,
  PieChart,
  BarChart3,
  Building2,
  Users
} from 'lucide-react';

// --- 类型定义 ---

type TabType = '报销补款' | '报销申请' | '订单垫付' | '提现申请' | '预支申请' | '还款申请' | '预支账单' | '财务收支' | '发票管理' | '银账查询财务' | '银账查询业务员' | '资产管理';

interface Column {
  title: string;
  width: string;
  align?: 'left' | 'center' | 'right';
  sticky?: 'right';
}

// --- 配置项 ---

const TAB_CONFIGS: Record<TabType, { search: string[], headers: string[], hideTable?: boolean }> = {
  '报销补款': {
    search: ['补款单编号', '公司', '部门', '事项', '购买人', '入库时间', '审核时间', '物品类型', '物品名称', '状态'],
    headers: ['入库时间', '补款单编号', '购买人', '录入人', '状态', '物品类型', '物品名称', '入库数量', '公司', '部门', '项目', '入库金额', '备注', '发票', '报销材料', '审核时间', '审核员', '审核意见', '审核图片', '补款总金额', '撤销原因', '撤销时间']
  },
  '报销申请': {
    search: ['报销单编号', '公司', '部门', '事项', '申请用户', '申请时间', '入账时间', '状态'],
    headers: ['报销单编号', '申请时间', '申请人', '状态', '公司', '部门', '事项', '金额', '报销凭证', '发票', '核销券码/订单编号', '备注', '物品类型', '物品名称', '物品数量', '统一社会信用代码', '订单号', '进补凭证', '审核时间', '主管审核', '审核意见', '入账时间', '财务审核', '入账意见', '撤销原因', '撤销时间']
  },
  '订单垫付': {
    search: ['订单号', '申请人', '补款渠道', '申请时间', '出库时间', '审批状态', '出库状态'],
    headers: ['垫付次数', '完工收入', '发起时间', '审批状态', '申请人', '订单来源', '补款渠道', '订单状态', '订单号', '总收款', '业绩', '垫付金额(手动)', '备注', '补款凭证', '审批时间', '审批人', '审批备注', '出库时间', '出库状态', '出纳', '出库意见', '付款凭证']
  },
  '提现申请': {
    search: ['申请人', '手机号码', '申请时间', '出纳时间', '状态'],
    headers: ['申请时间', '申请人', 'UID', '手机号码', '状态', '金额', '账户类型', '是否打款', '出纳时间', '出纳', '出纳意见', '备注', '错误信息', '付款凭证']
  },
  '预支申请': {
    search: ['申请用户', '预支编号', '申请时间', '提款时间', '状态'],
    headers: ['预支编号', '申请时间', '申请人', '部门', '状态', '用途说明', '预支金额(元)', '提款方式', '提款账号', '备注', '领导审核时间', '领导审核', '领导审核意见', '财务审核时间', '财务审核', '财务审核意见', '提款时间', '出纳审核', '提款意见', '撤销原因', '撤销时间', '提款失败原因']
  },
  '还款申请': {
    search: ['预支编号', '申请用户', '申请时间', '还款时间', '状态'],
    headers: ['预支编号', '申请时间', '申请人', '部门', '状态', '提款时间', '预支金额(元)', '待还金额(元)', '还款金额(元)', '备注', '领导审核时间', '领导审核', '领导审核意见', '还款时间', '财务审核', '财务意见']
  },
  '预支账单': {
    search: ['预支编号', '申请用户', '提款时间', '还款时间', '预支金额', '还款金额', '待还金额', '记录类型'],
    headers: ['预支编号', '记录类型', '申请时间', '申请人', '部门', '用途说明', '提款方式', '备注', '预支金额(元)', '提款时间', '还款金额(元)', '还款时间', '待还金额(元)']
  },
  '财务收支': {
    search: ['创建时间', '创建人', '交易状态', '收支项', '收支类型', '支付方式'],
    headers: ['创建人', '创建时间', '收支项', '金额', '收支类型', '支付订单号', '交易凭证号', '交易状态', '交易类型', '支付方式']
  },
  '发票管理': {
    search: ['申请人', '订单号', '状态', '申请时间'],
    headers: ['申请时间', '申请人', '状态', '订单号', '订单来源', '金额', '项目', '发票信息图片', '公司名称', '纳税识别号', '备注', '收票邮箱', '开票信息', '开票人', '开票时间', '审核说明']
  },
  '银账查询财务': {
    search: ['交易时间', '公司名称', '对方单位'],
    headers: ['公司名称', '交易时间', '转出金额', '转入金额', '账户余额', '对方单位', '摘要']
  },
  '银账查询业务员': {
    search: ['交易时间', '公司名称', '对方单位'],
    headers: ['公司名称', '交易时间', '转入金额', '对方单位', '摘要']
  },
  '资产管理': {
    search: [],
    headers: [],
    hideTable: true
  }
};

// --- Mock Data 生成 ---

const generateRows = (tab: TabType): any[] => {
  const config = TAB_CONFIGS[tab];
  if (!config.headers.length) return [];
  return Array.from({ length: 20 }).map((_, i) => {
    const row: any = { id: i + 1 };
    config.headers.forEach(h => {
      if (h.includes('时间')) row[h] = `2025-12-${String(18 - (i % 10)).padStart(2, '0')} 10:24:${String(i % 60).padStart(2, '0')}`;
      else if (h.includes('金额') || h.includes('总收款') || h.includes('业绩')) row[h] = (Math.random() * 5000).toFixed(2);
      else if (h.includes('人') || h.includes('员') || h.includes('出纳') || h.includes('主管') || h.includes('财务')) row[h] = i % 2 === 0 ? '管理员' : '陈清平';
      else if (h.includes('状态')) row[h] = i % 3 === 0 ? '已入账' : (i % 3 === 1 ? '待审批' : '出库成功');
      else if (h.includes('编号') || h.includes('单号') || h.includes('UID') || h.includes('代码')) row[h] = 'BXD' + (2025121800 + i);
      else if (h === '报销凭证') row[h] = '查看凭证(4)';
      else if (h.includes('发票') || h.includes('凭证')) row[h] = i % 4 === 0 ? '无' : '查看(1)';
      
      // 补充缺失的数据逻辑
      else if (h === '公司') row[h] = ['上海分公司', '北京总部', '深圳研发中心', '广州运营中心'][i % 4];
      else if (h === '部门') row[h] = ['市场部', '技术部', '人事部', '财务部'][i % 4];
      else if (h === '事项') row[h] = ['差旅费', '办公采购', '团建费用', '业务招待'][i % 4];
      else if (h === '备注') row[h] = ['常规报销', '紧急采购', '季度预算', '项目专项'][i % 4];
      else if (h === '物品类型') row[h] = ['办公耗材', '电子设备', '食品饮料', '交通工具'][i % 4];
      else if (h === '物品名称') row[h] = ['A4纸/笔', '显示器', '矿泉水', '加油费'][i % 4];
      else if (h.includes('数量')) row[h] = Math.floor(Math.random() * 50) + 1;
      else if (h === '统一社会信用代码') row[h] = '91310115MA1' + Math.floor(Math.random() * 100000);
      else if (h.includes('意见')) row[h] = ['同意', '合规', '请补充材料', '批准'][i % 4];
      else if (h.includes('原因')) row[h] = '无';

      else row[h] = '--';
    });
    return row;
  });
};

// 资产台账 Mock Data
const generateAssetLedgerData = () => {
  return Array.from({ length: 12 }).map((_, i) => ({
    id: i + 1,
    assetNo: `202510${String(Math.floor(Math.random() * 90000000) + 10000000)}`,
    assetName: ['凳子', '冰箱', '数据线', '鼠标', '小米手机', '虚拟资产'][i % 6],
    category: i === 11 ? '虚拟资产' : (i === 9 ? '手机' : '实物资产'),
    model: ['D-112', 'HAIER', 'type-c', 'K380', 'MI 10', '7'][i % 6],
    params: ['电竞椅', '90*150', '100w', '-', '12g + 256g', '7'][i % 6],
    purchaseDate: `2025-10-${String(15 - i).padStart(2, '0')} 00:00:00`,
    amount: [108.00, 59.00, 66.00, 169.00, 1098.32, 11.00][i % 6],
    status: i === 4 ? '租借中' : (i % 3 === 0 ? '在用' : '闲置'),
    owner: i % 3 === 0 ? (i % 2 === 0 ? '俞' : '李可') : '',
    dept: i % 3 === 0 ? '业务部' : '',
    location: i % 3 === 0 ? '9楼A903' : '',
    remarks: i % 5 === 0 ? '22时' : '',
    entryTime: `2025-10-13 17:54:${String(15 + i).padStart(2, '0')}`,
    hasImage: i === 3 || i === 4,
    imageCount: i === 3 ? 1 : (i === 4 ? 3 : 0),
    isRedRow: i === 4 
  }));
};


// --- 子组件 ---

const NotificationBar = () => (
  <div className="flex items-center justify-between mb-3 px-4 py-2 bg-white rounded-lg shadow-sm shrink-0 h-14 border border-slate-100">
    <div className="flex items-center gap-3 shrink-0">
      <button className="bg-[#1890ff] hover:bg-blue-600 text-white text-[13px] font-bold px-3 py-1.5 rounded flex items-center gap-2 transition-colors">
        主要公告 <Bell size={14} className="fill-current" />
      </button>
    </div>
    <div className="flex-1 overflow-hidden relative h-8 flex items-center mx-4">
      <div 
        className="whitespace-nowrap flex items-center gap-12 text-[13px] text-[#1e293b] font-medium"
        style={{ animation: 'marquee 3600s linear infinite' }}
      >
        <span className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-yellow-400"></div>
          <Megaphone size={16} className="text-slate-500"/> 
          职级晋升评审的通知: 点击下方详情以阅读完整公告内容。请所有相关人员务必在截止日期前完成确认。
        </span>
        <span className="flex items-center gap-2">
          <Flame size={16} className="text-[#f5222d]"/>
          <span className="text-[#1e293b] font-bold">10月业绩pk赛圆满结束，恭喜华东大区获得冠军！</span>
        </span>
        <span className="flex items-center gap-2">
           <div className="w-2 h-2 rounded-full bg-orange-400"></div>
           系统升级通知: 今晚 24:00 将进行系统维护。
        </span>
      </div>
    </div>
    <div className="bg-[#f5f5f5] text-slate-400 text-[12px] font-medium px-3 py-1 rounded">
      2025-11-19
    </div>
    <style>{`@keyframes marquee { 0% { transform: translateX(0); } 100% { transform: translateX(-100%); } }`}</style>
  </div>
);

const TabSelector = ({ activeTab, onSelect }: { activeTab: TabType, onSelect: (t: TabType) => void }) => {
  const tabs: TabType[] = ['报销补款', '报销申请', '订单垫付', '提现申请', '预支申请', '还款申请', '预支账单', '财务收支', '发票管理', '银账查询财务', '银账查询业务员', '资产管理'];
  
  // 截图风格的颜色定义 (红, 黄, 蓝, 绿, 青, 紫 循环)
  const styles = [
    { border: '#ffccc7', bg: '#fff1f0', text: '#ff4d4f', icon: Wallet },
    { border: '#ffe7ba', bg: '#fff7e6', text: '#fa8c16', icon: FileText },
    { border: '#bae0ff', bg: '#e6f7ff', text: '#1890ff', icon: CreditCard },
    { border: '#d9f7be', bg: '#f6ffed', text: '#52c41a', icon: Coins },
    { border: '#87e8de', bg: '#e6fffb', text: '#13c2c2', icon: Receipt },
    { border: '#efdbff', bg: '#f9f0ff', text: '#722ed1', icon: Landmark },
  ];

  return (
    <div className="grid grid-cols-6 gap-3 mb-3">
      {tabs.map((tab, idx) => {
        const isActive = activeTab === tab;
        const style = styles[idx % styles.length];
        const Icon = style.icon;
        
        return (
          <button
            key={tab}
            onClick={() => onSelect(tab)}
            className={`
              h-11 rounded-lg flex items-center justify-center gap-2 text-[13px] font-bold transition-all duration-200 relative overflow-hidden group
              ${isActive ? 'shadow-md scale-105 z-10' : 'hover:scale-105 hover:z-10'}
            `}
            style={{
              backgroundColor: 'white',
              color: '#1e293b', // slate-800
              borderWidth: isActive ? '2px' : '1px',
              borderStyle: 'solid',
              borderColor: style.text,
            }}
          >
            <div className={`p-1 rounded-full`} style={{ backgroundColor: style.text, color: 'white' }}>
               <Icon size={14} strokeWidth={3} />
            </div>
            <span>{tab}</span>
          </button>
        );
      })}
    </div>
  );
};

const DataOverview = ({ 
  activeTab, 
  assetSubTab, 
  setAssetSubTab, 
  onToggleSearch 
}: { 
  activeTab: TabType, 
  assetSubTab: 'overview' | 'ledger', 
  setAssetSubTab: (t: 'overview' | 'ledger') => void, 
  onToggleSearch: () => void 
}) => (
  <div className="bg-white rounded-lg border border-slate-200 overflow-hidden flex items-center shadow-sm h-14 mb-3 px-4">
    {activeTab === '资产管理' ? (
        <div className="flex gap-4 flex-1">
           <div className="flex items-center gap-2 mr-6">
            <div className="w-8 h-8 rounded-full bg-[#1890ff] flex items-center justify-center text-white">
               <Activity size={18} />
            </div>
            <span className="text-[15px] font-bold text-slate-800">资产管理</span>
          </div>
           <button 
             onClick={() => setAssetSubTab('overview')}
             className={`text-sm font-bold relative h-14 px-2 flex items-center ${assetSubTab === 'overview' ? 'text-[#1890ff]' : 'text-slate-600 hover:text-[#1890ff]'}`}
           >
             资产总览
             {assetSubTab === 'overview' && <div className="absolute bottom-0 left-0 w-full h-0.5 bg-[#1890ff]"></div>}
           </button>
           <button 
             onClick={() => setAssetSubTab('ledger')}
             className={`text-sm font-bold relative h-14 px-2 flex items-center ${assetSubTab === 'ledger' ? 'text-[#1890ff]' : 'text-slate-600 hover:text-[#1890ff]'}`}
           >
             资产台账
             {assetSubTab === 'ledger' && <div className="absolute bottom-0 left-0 w-full h-0.5 bg-[#1890ff]"></div>}
           </button>
           <div className="flex-1"></div>
           <div 
            onClick={onToggleSearch}
            className="flex items-center gap-1 text-[#1890ff] font-medium text-[13px] cursor-pointer hover:underline"
          >
            <Search size={14} />
            <span>点这高级筛选</span>
          </div>
        </div>
      ) : (
      <>
        <div className="flex items-center gap-3 shrink-0 mr-8">
          <div className="w-8 h-8 rounded-full bg-[#1890ff] flex items-center justify-center text-white">
             <PieChart size={16} className="fill-current" />
          </div>
          <span className="text-[14px] font-bold text-slate-600">数据概览</span>
        </div>
        
        <div className="flex-1 flex items-center gap-6 overflow-x-auto no-scrollbar">
          {[
             { label: '其它类400客户量', val: '158', color: '#f5222d' },
             { label: '正常类400客户量', val: '342', color: '#1890ff' },
             { label: '400总接听量', val: '500', color: '#52c41a' },
             { label: '其它类客户占比', val: '31.6%', color: '#722ed1' },
             { label: '正常类400客户占比', val: '68.4%', color: '#13c2c2' },
             { label: '预约单录单量', val: '85', color: '#fa8c16' },
             { label: '预约单回访量', val: '80', color: '#eb2f96' },
             { label: '400电话转化率', val: '42.0%', color: '#f5222d' },
          ].map((item, i) => (
            <div key={i} className="flex items-baseline gap-1 whitespace-nowrap">
              <span className="text-[12px] text-slate-500 font-medium">{item.label}</span>
              <span className="text-[20px] font-bold font-mono" style={{ color: item.color }}>{item.val}</span>
            </div>
          ))}
        </div>

        <div className="flex items-center gap-4 pl-4 border-l border-slate-100 ml-4 shrink-0">
          <button className="bg-[#1890ff] hover:bg-blue-600 text-white text-[12px] font-medium px-4 py-1.5 rounded flex items-center gap-1 transition-colors shadow-sm">
             <Plus size={14} /> 新增
          </button>
          <div 
            onClick={onToggleSearch}
            className="flex items-center gap-1 text-[#1890ff] font-medium text-[13px] cursor-pointer hover:underline"
          >
            <Search size={14} />
            <span>点这高级筛选</span>
          </div>
        </div>
      </>
    )}
  </div>
);

const SearchPanel = ({ tab, isVisible }: { tab: TabType, isVisible: boolean }) => {
  const config = TAB_CONFIGS[tab];
  if (tab === '资产管理') return null; // 资产管理有自定义的搜索面板
  if (!isVisible) return null;
  if (config.search.length === 0) return null;

  const renderField = (field: string) => (
    <div key={field} className="flex items-center gap-2 min-w-[200px]">
      <span className="text-[11px] text-slate-500 shrink-0 whitespace-nowrap font-sans">{field}</span>
      {field.includes('时间') || field.includes('日期') ? (
        <div className="flex items-center gap-1 flex-1">
          <input type="date" className="flex-1 border border-slate-200 rounded h-7 px-1 text-[10px] outline-none font-mono" />
          <span className="text-slate-300">至</span>
          <input type="date" className="flex-1 border border-slate-200 rounded h-7 px-1 text-[10px] outline-none font-mono" />
        </div>
      ) : (
        <input type="text" placeholder="请输入内容" className="flex-1 border border-slate-200 rounded h-7 px-2 text-[11px] outline-none focus:border-blue-400 font-sans" />
      )}
    </div>
  );

  return (
    <div className="bg-white p-4 border border-slate-200 rounded-lg shadow-sm mb-2">
      <div className="flex flex-wrap gap-x-6 gap-y-3 items-center">
        {config.search.map(renderField)}
        
        {/* 操作按钮区：紧跟在筛选项后面 */}
        <div className="flex items-center gap-2 border-l border-slate-200 pl-4 ml-2">
          <button className="h-7 px-4 bg-[#1890ff] text-white rounded text-[11px] hover:bg-blue-600 transition-colors font-sans">搜索</button>
          <button className="h-7 px-4 bg-white border border-slate-200 text-slate-600 rounded text-[11px] hover:bg-slate-50 transition-colors font-sans">重置</button>
          
          <div className="w-[1px] h-4 bg-slate-200 mx-2"></div>

          <button className="h-7 px-3 bg-[#1890ff] text-white rounded-md text-[11px] flex items-center gap-1 hover:bg-blue-600 transition-colors font-sans">
            <Plus size={14}/> 新增
          </button>
          <button className="h-7 px-3 bg-[#1890ff] text-white rounded-md text-[11px] flex items-center gap-1 hover:bg-blue-600 transition-colors font-sans">
            <FileSpreadsheet size={14}/> 导出
          </button>
          {tab === '报销补款' && (
            <button className="h-7 px-3 bg-[#1890ff] text-white rounded-md text-[11px] flex items-center gap-1 hover:bg-blue-600 transition-colors font-sans">
              <History size={14}/> 补款记录
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

const App = () => {
  const [activeTab, setActiveTab] = useState<TabType>('报销申请');
  const [assetSubTab, setAssetSubTab] = useState<'overview' | 'ledger'>('overview');
  const [currentPage, setCurrentPage] = useState(1);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const pageSize = 20;

  const config = TAB_CONFIGS[activeTab];
  const data = useMemo(() => generateRows(activeTab), [activeTab]);
  const assetLedgerData = useMemo(() => generateAssetLedgerData(), []);

  // 渲染资产台账表格
  const renderAssetLedger = () => (
    <>
      {isSearchOpen && (
        <div className="bg-white p-4 border border-slate-200 rounded-lg shadow-sm mb-2 flex flex-wrap gap-4 items-center">
          <div className="flex items-center gap-2">
            <span className="text-[11px] text-slate-500 font-sans">资产编号</span>
            <input type="text" placeholder="请输入内容" className="border border-slate-200 rounded h-7 px-2 text-[11px] w-32 outline-none focus:border-blue-400 font-mono" />
          </div>
          <div className="flex items-center gap-2">
            <span className="text-[11px] text-slate-500 font-sans">资产名称</span>
            <input type="text" placeholder="请输入内容" className="border border-slate-200 rounded h-7 px-2 text-[11px] w-32 outline-none focus:border-blue-400 font-sans" />
          </div>
          <div className="flex items-center gap-2">
            <span className="text-[11px] text-slate-500 font-sans">资产状态</span>
            <select className="border border-slate-200 rounded h-7 px-2 text-[11px] w-24 outline-none focus:border-blue-400 bg-white font-sans">
              <option>请选择</option>
              <option>在用</option>
              <option>闲置</option>
              <option>租借中</option>
            </select>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-[11px] text-slate-500 font-sans">采购日期</span>
            <div className="flex items-center gap-1">
              <div className="relative">
                 <Clock size={12} className="absolute left-1 top-1.5 text-slate-300"/>
                 <input type="text" placeholder="开始日期" className="border border-slate-200 rounded h-7 pl-5 pr-2 text-[11px] w-24 outline-none focus:border-blue-400 font-mono" />
              </div>
              <span className="text-slate-400">至</span>
              <input type="text" placeholder="结束日期" className="border border-slate-200 rounded h-7 px-2 text-[11px] w-24 outline-none focus:border-blue-400 font-mono" />
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-[11px] text-slate-500 font-sans">录入时间</span>
            <div className="flex items-center gap-1">
              <div className="relative">
                 <Clock size={12} className="absolute left-1 top-1.5 text-slate-300"/>
                 <input type="text" placeholder="开始日期" className="border border-slate-200 rounded h-7 pl-5 pr-2 text-[11px] w-24 outline-none focus:border-blue-400 font-mono" />
              </div>
              <span className="text-slate-400">至</span>
              <input type="text" placeholder="结束日期" className="border border-slate-200 rounded h-7 px-2 text-[11px] w-24 outline-none focus:border-blue-400 font-mono" />
            </div>
          </div>
          <button className="h-7 px-4 bg-[#1890ff] text-white rounded text-[11px] hover:bg-blue-600 transition-colors font-sans">搜索</button>
          <button className="h-7 px-4 bg-white border border-slate-200 text-slate-600 rounded text-[11px] hover:bg-slate-50 transition-colors font-sans">重置</button>
          
          <div className="w-[1px] h-4 bg-slate-200 mx-2"></div>

          <button className="h-7 px-3 bg-[#1890ff] text-white rounded text-[11px] flex items-center gap-1 hover:bg-blue-600 transition-colors font-sans">
            <Plus size={14}/> 新增
          </button>
          <button className="h-7 px-3 bg-[#52c41a] text-white rounded text-[11px] flex items-center gap-1 hover:bg-green-600 transition-colors font-sans">
            <Import size={14}/> 导入
          </button>
          <button className="h-7 px-3 bg-[#1890ff] text-white rounded text-[11px] flex items-center gap-1 hover:bg-blue-600 transition-colors font-sans">
            <FileSpreadsheet size={14}/> 导出
          </button>
        </div>
      )}

      <div className="bg-white rounded-lg shadow-sm border border-slate-200 flex-1 flex flex-col overflow-hidden">
        <div className="overflow-auto flex-1">
          <table className="w-full text-left border-collapse min-w-[2000px]">
             <thead className="sticky top-0 z-20 bg-slate-50 border-b border-slate-300">
               <tr className="text-[11px] font-bold text-slate-800 uppercase tracking-wider font-sans">
                 <th className="px-3 py-3 text-center w-14 border-r border-slate-100 whitespace-nowrap">序号</th>
                 {['资产编号', '资产名称', '资产分类', '规格型号', '参数', '采购日期', '金额', '状态', '使用人', '部门', '存放地点', '备注', '录入时间'].map(h => (
                   <th key={h} className="px-3 py-3 border-r border-slate-100 whitespace-nowrap">{h}</th>
                 ))}
                 <th className="px-3 py-3 w-32 text-center sticky right-0 bg-slate-50 shadow-[-4px_0_4px_rgba(0,0,0,0.02)] whitespace-nowrap">操作</th>
               </tr>
             </thead>
             <tbody>
               {assetLedgerData.map((row, idx) => (
                 <tr key={row.id} className={`hover:bg-blue-50/40 transition-colors text-[11px] text-slate-600 h-11 border-b border-slate-300 ${row.isRedRow ? 'bg-red-50 text-red-600' : (idx % 2 === 1 ? 'bg-[#FFF0F0]' : 'bg-white')}`}>
                    <td className="px-3 py-1 text-center border-r border-slate-100 font-mono">{row.id}</td>
                    <td className="px-3 py-1 border-r border-slate-100 font-mono">{row.assetNo}</td>
                    <td className="px-3 py-1 border-r border-slate-100 font-bold">{row.assetName}</td>
                    <td className="px-3 py-1 border-r border-slate-100">{row.category}</td>
                    <td className="px-3 py-1 border-r border-slate-100">{row.model}</td>
                    <td className="px-3 py-1 border-r border-slate-100">{row.params}</td>
                    <td className="px-3 py-1 border-r border-slate-100 font-mono">{row.purchaseDate.split(' ')[0]}</td>
                    <td className="px-3 py-1 border-r border-slate-100 font-mono text-right">{row.amount.toFixed(2)}</td>
                    <td className="px-3 py-1 border-r border-slate-100">
                      <span className={`px-2 py-0.5 rounded-full text-[10px] ${row.status === '在用' ? 'bg-green-100 text-green-700' : (row.status === '闲置' ? 'bg-gray-100 text-gray-600' : 'bg-orange-100 text-orange-700')}`}>
                        {row.status}
                      </span>
                    </td>
                    <td className="px-3 py-1 border-r border-slate-100">{row.owner}</td>
                    <td className="px-3 py-1 border-r border-slate-100">{row.dept}</td>
                    <td className="px-3 py-1 border-r border-slate-100">{row.location}</td>
                    <td className="px-3 py-1 border-r border-slate-100">{row.remarks}</td>
                    <td className="px-3 py-1 border-r border-slate-100 font-mono">{row.entryTime}</td>
                    <td className="px-3 py-1 text-center sticky right-0 bg-white group-hover:bg-blue-50/40 shadow-[-4px_0_4px_rgba(0,0,0,0.02)]">
                      <div className="flex justify-center gap-2">
                        <button className="text-[#1890ff] hover:underline font-medium">编辑</button>
                        <button className="text-[#1890ff] hover:underline font-medium">详情</button>
                      </div>
                    </td>
                 </tr>
               ))}
             </tbody>
          </table>
        </div>
        <div className="px-4 py-2 border-t border-slate-200 flex items-center justify-center gap-4 text-[11px] bg-slate-50 font-sans">
           <span className="text-slate-500">共 <span className="font-mono">{assetLedgerData.length}</span> 条</span>
           <select className="border border-slate-200 rounded h-6 text-[11px] outline-none font-sans">
             <option>10条/页</option>
             <option>20条/页</option>
           </select>
           <div className="flex gap-1">
              <button className="w-6 h-6 border border-slate-200 rounded flex items-center justify-center bg-white hover:bg-slate-50"><ChevronLeft size={12}/></button>
              <button className="w-6 h-6 border bg-[#1890ff] text-white border-[#1890ff] rounded flex items-center justify-center font-mono">1</button>
              <button className="w-6 h-6 border border-slate-200 rounded flex items-center justify-center bg-white hover:bg-slate-50 font-mono">2</button>
              <button className="w-6 h-6 border border-slate-200 rounded flex items-center justify-center bg-white hover:bg-slate-50 font-mono">3</button>
              <button className="w-6 h-6 border border-slate-200 rounded flex items-center justify-center bg-white hover:bg-slate-50"><ChevronRight size={12}/></button>
           </div>
           <div className="flex items-center gap-1">
              <span>前往</span>
              <input type="text" defaultValue="1" className="w-8 h-6 border border-slate-200 rounded text-center outline-none font-mono" />
              <span>页</span>
                   </div>
                </div>
      </div>
    </>
  );

  const renderAssetOverview = () => {
    const stats = [
      { label: '总资产', count: '21个' },
      { label: '在用资产', count: '6个' },
      { label: '租赁中资产', count: '2个' },
      { label: '闲置资产', count: '11个' },
      { label: '报废资产', count: '2个' },
    ];
  
    const barData = [
      { name: '虚拟资产', value: 4 },
      { name: '实物资产', value: 15 },
      { name: '手机', value: 2 },
    ];
  
    const pieData = [
       { name: '在用', value: 6, color: '#5b73e8' },   // Blueish
       { name: '闲置', value: 11, color: '#82ca68' },  // Greenish
       { name: '租赁中', value: 2, color: '#f7c44e' }, // Yellowish
       { name: '已报废', value: 2, color: '#f26262' }, // Reddish
    ];
    
    // Calculate pie chart dash arrays
    const total = pieData.reduce((acc, cur) => acc + cur.value, 0);
    let accumulated = 0;
    const pieSegments = pieData.map(item => {
      const percentage = item.value / total;
      const dashArray = `${percentage * 2 * Math.PI * 40} ${2 * Math.PI * 40}`;
      const rotate = accumulated * 360;
      accumulated += percentage;
      return { ...item, dashArray, rotate };
    });
  
    return (
      <div className="flex flex-col gap-4 h-full overflow-auto">
        {/* Top Stats Cards */}
        <div className="flex gap-4 shrink-0">
          {stats.map((stat, index) => (
            <div key={index} className="bg-white p-4 rounded-lg border border-slate-200 shadow-sm w-32 flex flex-col items-center justify-center h-20">
               <div className="text-lg font-bold text-slate-800 font-mono">{stat.count}</div>
               <div className="text-xs text-slate-500 mt-1">{stat.label}</div>
            </div>
          ))}
        </div>
  
        {/* Charts Area */}
        <div className="flex flex-1 gap-4 min-h-0">
          {/* Left: Bar Chart */}
          <div className="flex-[2] bg-white p-5 rounded-lg border border-slate-200 shadow-sm flex flex-col">
             <div className="flex justify-between items-center mb-6">
               <h3 className="text-sm font-bold text-slate-800">资产分类统计</h3>
               <div className="flex gap-2 text-[11px] text-slate-500">
                 <span className="bg-blue-50 text-blue-600 px-2 py-0.5 rounded cursor-pointer">全部</span>
                 <span className="hover:text-slate-700 cursor-pointer">在用</span>
                 <span className="hover:text-slate-700 cursor-pointer">闲置</span>
                 <span className="hover:text-slate-700 cursor-pointer">租赁中</span>
                 <span className="hover:text-slate-700 cursor-pointer">已报废</span>
               </div>
             </div>
             
             <div className="flex-1 relative flex items-end pb-8 px-4">
                {/* Y Axis Grid Lines */}
                <div className="absolute inset-0 flex flex-col justify-between pointer-events-none pb-8 pl-8 pr-4">
                   {[15, 12, 9, 6, 3, 0].map((val, i) => (
                     <div key={i} className="w-full border-t border-slate-100 relative h-0">
                       <span className="absolute -left-8 -top-2 text-[10px] text-slate-400 w-6 text-right font-mono">{val}</span>
                     </div>
                   ))}
                </div>
  
                {/* Bars */}
                <div className="flex justify-around items-end w-full h-full pl-8 z-10">
                   {barData.map((item, i) => {
                     const heightPercent = (item.value / 15) * 100;
                     return (
                       <div key={i} className="flex flex-col items-center gap-2 group w-1/4">
                         <div className="text-[10px] text-[#4285F4] font-bold mb-1 opacity-0 group-hover:opacity-100 transition-opacity font-mono">{item.value}</div>
                         <div 
                           className="w-4 bg-[#4285F4] rounded-t-sm hover:opacity-90 transition-all relative"
                           style={{ height: `${heightPercent}%` }}
                         >
                            {/* Label on top specifically for screenshot match */}
                            <div className="absolute -top-5 left-1/2 -translate-x-1/2 text-[10px] text-[#4285F4] font-bold font-mono">{item.value}</div>
                         </div>
                         <div className="text-[11px] text-slate-500 mt-1">{item.name}</div>
                       </div>
                     )
                   })}
                </div>
             </div>
          </div>
  
          {/* Right: Pie Chart */}
          <div className="flex-1 bg-white p-5 rounded-lg border border-slate-200 shadow-sm flex flex-col">
             <h3 className="text-sm font-bold text-slate-800 mb-4">资产状态分布</h3>
             <div className="flex-1 flex flex-col items-center justify-center">
                <div className="relative w-48 h-48">
                   <svg viewBox="0 0 100 100" className="w-full h-full -rotate-90">
                     {pieSegments.map((seg, i) => (
                       <circle
                         key={i}
                         cx="50"
                         cy="50"
                         r="40"
                         fill="transparent"
                         stroke={seg.color}
                         strokeWidth="12"
                         strokeDasharray={seg.dashArray}
                         strokeDashoffset="0"
                         transform={`rotate(${seg.rotate} 50 50)`}
                       />
                     ))}
                   </svg>
                </div>
                <div className="flex gap-4 mt-8 flex-wrap justify-center">
                   {pieData.map((item, i) => (
                     <div key={i} className="flex items-center gap-1.5">
                        <div className="w-3 h-2 rounded-[2px]" style={{ backgroundColor: item.color }}></div>
                        <span className="text-[11px] text-slate-500">{item.name}</span>
                     </div>
                   ))}
                </div>
             </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="h-screen bg-slate-50 p-4 font-sans text-slate-900 flex flex-col overflow-hidden">
       <NotificationBar />
       <TabSelector activeTab={activeTab} onSelect={setActiveTab} />
       <DataOverview 
         activeTab={activeTab} 
         assetSubTab={assetSubTab} 
         setAssetSubTab={setAssetSubTab}
         onToggleSearch={() => setIsSearchOpen(!isSearchOpen)}
       />
       <SearchPanel tab={activeTab} isVisible={isSearchOpen} />

       <div className="flex-1 flex flex-col min-h-0">
          {activeTab === '资产管理' ? (
             assetSubTab === 'ledger' ? renderAssetLedger() : renderAssetOverview()
          ) : (
            <div className="bg-white rounded-lg shadow-sm border border-slate-200 flex-1 flex flex-col overflow-hidden">
                <div className="overflow-auto flex-1">
                  <table className={`w-full text-left border-collapse ${activeTab === '报销申请' ? 'min-w-[1600px]' : 'min-w-[2400px]'}`}>
                    <thead className="sticky top-0 z-20 bg-slate-50 border-b border-slate-300">
                      <tr className="text-[11px] font-bold text-slate-800 uppercase tracking-wider font-sans">
                        <th className="px-3 py-3 text-center w-14 border-r border-slate-100 whitespace-nowrap">序号</th>
                        {config.headers.map(h => {
                           const alignCenter = h.includes('金额');
                           const alignRight = h.includes('收款') || h.includes('业绩') || h.includes('余额');
                           const isCompact = activeTab === '报销申请';
                           return (
                             <th key={h} className={`${isCompact ? 'px-2 py-2 min-w-[60px]' : 'px-3 py-3 min-w-[120px]'} border-r border-slate-100 font-sans whitespace-nowrap ${alignRight ? 'text-right' : (alignCenter ? 'text-center' : '')}`}>{h}</th>
                           )
                        })}
                        <th className="px-3 py-3 w-32 text-center sticky right-0 bg-slate-50 shadow-[-4px_0_4px_rgba(0,0,0,0.02)] font-sans whitespace-nowrap">操作</th>
                      </tr>
                    </thead>
                    <tbody>
                      {data.map((row, idx) => (
                        <tr key={idx} className={`hover:bg-blue-50/40 transition-colors text-[11px] text-slate-600 h-11 border-b border-slate-300 ${idx % 2 === 1 ? 'bg-[#FFF0F0]' : 'bg-white'}`}>
                           <td className="px-3 py-1 text-center border-r border-slate-100 font-mono">{(currentPage - 1) * pageSize + idx + 1}</td>
                           {config.headers.map(h => {
                             const isMonoField = h.includes('时间') || h.includes('日期') || h.includes('金额') || h.includes('编号') || h.includes('单号') || h.includes('UID') || h.includes('代码') || h.includes('数量') || h.includes('收款') || h.includes('业绩') || h.includes('余额') || h === '手机号码';
                             const alignRight = h.includes('收款') || h.includes('业绩') || h.includes('余额');
                             const alignCenter = h.includes('金额');
                             const isCompact = activeTab === '报销申请';
                             return (
                               <td key={h} className={`${isCompact ? 'px-2' : 'px-3'} py-1 border-r border-slate-100 max-w-[200px] ${(h !== '报销凭证' && h !== '发票') ? 'truncate' : ''} ${alignRight ? 'text-right' : (alignCenter ? 'text-center' : '')} ${isMonoField ? 'font-mono' : 'font-sans'}`}>
                                 {(h === '报销凭证' || h === '发票') ? (
                                   <div className="relative group cursor-pointer flex items-center gap-1 text-[#1890ff] font-sans">
                                     <ImageIcon size={14} />
                                     <span>{row[h]}</span>
                                      <div className={`absolute left-full ml-4 ${idx < 4 ? 'top-0 translate-y-0' : 'top-1/2 -translate-y-1/2'} z-[100] hidden group-hover:block p-4 bg-white border border-slate-200 rounded-xl shadow-2xl animate-in fade-in zoom-in-95 duration-200 min-w-[640px]`}>
                                        <div className="mb-3 flex items-center justify-between border-b pb-2 border-slate-100">
                                          <div className="flex flex-col">
                                            <span className="text-[13px] font-bold text-slate-800 font-sans">{h}详情预览</span>
                                            <span className="text-[10px] text-slate-400 font-mono">单号: {row['报销单编号'] || row['订单号'] || '--'}</span>
                                          </div>
                                          <div className="bg-blue-50 text-[#1890ff] px-2 py-0.5 rounded text-[10px] font-medium font-sans">共 {h === '报销凭证' ? '4' : '1'} 张图片</div>
                                        </div>
                                        <div className="grid grid-cols-2 gap-3">
                                          {[1, 2, 3, 4].map(num => (
                                            <div key={num} className="relative group/img overflow-hidden rounded-lg border border-slate-100 shadow-sm bg-slate-50 aspect-[4/3]">
                                              <img 
                                                src={`https://picsum.photos/seed/${idx + (h==='发票'?100:50) + num}/400/300`} 
                                                alt={`凭证图片 ${num}`} 
                                                className="w-full h-full object-cover transition-transform duration-500 group-hover/img:scale-105"
                                              />
                                              <div className="absolute bottom-1 right-1 bg-black/50 backdrop-blur-sm text-[9px] text-white px-1.5 py-0.5 rounded-md font-sans">图 {num}</div>
                                            </div>
                                          ))}
                                        </div>
                                        <div className="mt-3 pt-2 border-t border-slate-50 text-[10px] text-center text-slate-400 font-medium flex items-center justify-center gap-1 font-sans">
                                          <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse"></div>
                                          <span>凭证图片预览中 - 请确保所有材料真实有效</span>
                                        </div>
                                      </div>
                                   </div>
                                 ) : (
                                   row[h]
                                 )}
                               </td>
                             )
                           })}
                           <td className={`px-3 py-1 text-center sticky right-0 group-hover:bg-blue-50/40 shadow-[-4px_0_4px_rgba(0,0,0,0.02)] ${idx % 2 === 1 ? 'bg-[#FFF0F0]' : 'bg-white'} font-sans`}>
                              <div className="flex justify-center gap-2">
                                <button className="text-[#1890ff] hover:underline font-medium">详情</button>
                                <button className="text-[#1890ff] hover:underline font-medium">审批</button>
                              </div>
                           </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                <div className="px-4 py-2 border-t border-slate-200 flex items-center justify-center gap-4 text-[11px] bg-slate-50 font-sans">
                   <span className="text-slate-500">共 <span className="font-mono">{data.length}</span> 条</span>
                   <select className="border border-slate-200 rounded h-6 text-[11px] outline-none font-sans">
                     <option>10条/页</option>
                     <option>20条/页</option>
                   </select>
                   <div className="flex gap-1">
                      <button className="w-6 h-6 border border-slate-200 rounded flex items-center justify-center bg-white hover:bg-slate-50"><ChevronLeft size={12}/></button>
                      <button className="w-6 h-6 border bg-[#1890ff] text-white border-[#1890ff] rounded flex items-center justify-center font-mono">1</button>
                      <button className="w-6 h-6 border border-slate-200 rounded flex items-center justify-center bg-white hover:bg-slate-50 font-mono">2</button>
                      <button className="w-6 h-6 border border-slate-200 rounded flex items-center justify-center bg-white hover:bg-slate-50 font-mono">3</button>
                      <button className="w-6 h-6 border border-slate-200 rounded flex items-center justify-center bg-white hover:bg-slate-50"><ChevronRight size={12}/></button>
                   </div>
                   <div className="flex items-center gap-1">
                      <span>前往</span>
                      <input type="text" defaultValue="1" className="w-8 h-6 border border-slate-200 rounded text-center outline-none font-mono" />
                      <span>页</span>
                   </div>
                </div>
            </div>
          )}
       </div>
    </div>
  );
};

const container = document.getElementById('root');
if (container) { const root = createRoot(container); root.render(<App />); }
