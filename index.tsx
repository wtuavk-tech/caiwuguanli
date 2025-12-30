
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
    headers: ['报销单编号', '申请时间', '申请人', 'UID', '状态', '公司', '部门', '事项', '金额', '报销凭证', '本金', '佣金', '核销券码/订单编号', '备注', '物品类型', '物品名称', '物品数量', '统一社会信用代码', '订单号', '发票', '进补凭证', '审核时间', '主管审核', '审核意见', '入账时间', '财务审核', '入账意见', '撤销原因', '撤销时间']
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
      else if (h.includes('编号') || h.includes('单号') || h.includes('UID')) row[h] = 'BXD' + (2025121800 + i);
      else if (h === '报销凭证') row[h] = '查看凭证(4)';
      else if (h.includes('发票') || h.includes('凭证')) row[h] = i % 4 === 0 ? '无' : '查看(1)';
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
              h-12 rounded-lg flex items-center justify-center gap-2 text-[13px] font-bold transition-all duration-200 relative overflow-hidden group
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
             <BarChart3 size={16} className="fill-current" />
          </div>
          <span className="text-[15px] font-bold text-slate-800">数据概览</span>
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
              <span className="text-[16px] font-bold font-mono" style={{ color: item.color }}>{item.val}</span>
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

      {/* 移除了独立的按钮行，因为已经合并到上方 */}

      <div className="bg-white rounded-lg shadow-sm border border-slate-200 flex-1 flex flex-col overflow-hidden">
        <div className="overflow-auto flex-1">
          <table className="w-full text-left border-collapse min-w-[1800px]">
            <thead className="sticky top-0 z-20 bg-slate-50 border-b border-slate-300">
              <tr className="text-[11px] font-bold text-slate-800 font-sans">
                <th className="px-3 py-3 border-r border-slate-100 text-center w-12 whitespace-nowrap">序号</th>
                <th className="px-3 py-3 border-r border-slate-100 whitespace-nowrap">资产编号</th>
                <th className="px-3 py-3 border-r border-slate-100 whitespace-nowrap">资产名称</th>
                <th className="px-3 py-3 border-r border-slate-100 whitespace-nowrap">资产类别</th>
                <th className="px-3 py-3 border-r border-slate-100 whitespace-nowrap">品牌型号</th>
                <th className="px-3 py-3 border-r border-slate-100 whitespace-nowrap">配置参数</th>
                <th className="px-3 py-3 border-r border-slate-100 whitespace-nowrap">采购日期</th>
                <th className="px-3 py-3 border-r border-slate-100 text-right whitespace-nowrap">采购金额</th>
                <th className="px-3 py-3 border-r border-slate-100 text-center whitespace-nowrap">发票</th>
                <th className="px-3 py-3 border-r border-slate-100 text-center whitespace-nowrap">资产状态</th>
                <th className="px-3 py-3 border-r border-slate-100 whitespace-nowrap">归属人</th>
                <th className="px-3 py-3 border-r border-slate-100 whitespace-nowrap">部门</th>
                <th className="px-3 py-3 border-r border-slate-100 whitespace-nowrap">位置</th>
                <th className="px-3 py-3 border-r border-slate-100 text-center whitespace-nowrap">图片</th>
                <th className="px-3 py-3 border-r border-slate-100 whitespace-nowrap">残值收入</th>
                <th className="px-3 py-3 border-r border-slate-100 whitespace-nowrap">备注</th>
                <th className="px-3 py-3 border-r border-slate-100 whitespace-nowrap">录入时间</th>
                <th className="px-3 py-3 text-center sticky right-0 bg-slate-50 shadow-[-4px_0_4px_rgba(0,0,0,0.02)] whitespace-nowrap">操作</th>
              </tr>
            </thead>
            <tbody>
              {assetLedgerData.map((row, idx) => (
                <tr key={row.id} className={`text-[11px] text-slate-600 h-10 border-b border-slate-300 hover:bg-blue-50/40 transition-colors ${row.isRedRow ? 'bg-red-300 bg-opacity-50' : (idx % 2 === 1 ? 'bg-[#FFF0F0]' : 'bg-white')}`}>
                  <td className="px-3 py-1 text-center border-r border-slate-100 font-mono">{row.id}</td>
                  <td className="px-3 py-1 border-r border-slate-100 font-mono">{row.assetNo}</td>
                  <td className="px-3 py-1 border-r border-slate-100 font-sans">{row.assetName}</td>
                  <td className="px-3 py-1 border-r border-slate-100 font-sans">{row.category}</td>
                  <td className="px-3 py-1 border-r border-slate-100 font-sans">{row.model}</td>
                  <td className="px-3 py-1 border-r border-slate-100 font-sans">{row.params}</td>
                  <td className="px-3 py-1 border-r border-slate-100 font-mono">{row.purchaseDate}</td>
                  <td className="px-3 py-1 border-r border-slate-100 text-right font-mono">{row.amount.toFixed(2)}</td>
                  <td className="px-3 py-1 border-r border-slate-100 text-center font-sans"></td>
                  <td className="px-3 py-1 border-r border-slate-100 text-center font-sans">
                    <span className={`px-2 py-0.5 rounded ${
                      row.status === '在用' ? 'bg-blue-50 text-blue-500' :
                      row.status === '租借中' || row.status === '租赁' ? 'bg-orange-50 text-orange-500' :
                      'bg-slate-100 text-slate-500'
                    }`}>
                      {row.status}
                    </span>
                  </td>
                  <td className="px-3 py-1 border-r border-slate-100 font-sans">{row.owner}</td>
                  <td className="px-3 py-1 border-r border-slate-100 font-sans">{row.dept}</td>
                  <td className="px-3 py-1 border-r border-slate-100 font-sans">{row.location}</td>
                  <td className="px-3 py-1 border-r border-slate-100 text-center font-sans">
                    {row.hasImage && (
                      <div className="inline-flex items-center justify-center relative">
                         <span className="text-[#1890ff] cursor-pointer hover:underline">图片</span>
                         {row.imageCount > 0 && (
                           <span className="absolute -top-2 -right-3 bg-red-500 text-white text-[9px] w-3.5 h-3.5 flex items-center justify-center rounded-full font-mono">{row.imageCount}</span>
                         )}
                      </div>
                    )}
                  </td>
                  <td className="px-3 py-1 border-r border-slate-100 font-mono"></td>
                  <td className="px-3 py-1 border-r border-slate-100 font-sans">{row.remarks}</td>
                  <td className="px-3 py-1 border-r border-slate-100 font-mono">{row.entryTime}</td>
                  <td className={`px-3 py-1 text-center sticky right-0 shadow-[-4px_0_4px_rgba(0,0,0,0.02)] ${row.isRedRow ? 'bg-red-300 bg-opacity-0' : (idx % 2 === 1 ? 'bg-[#FFF0F0]' : 'bg-white')} font-sans`}>
                    <div className="flex justify-center gap-2 text-[#1890ff]">
                      <button className="hover:underline">修改</button>
                      <button className="hover:underline">领用</button>
                      <button className="hover:underline">租赁</button>
                      <button className="hover:underline">报废</button>
                    </div>
                    <div className="flex justify-center gap-2 text-[#1890ff] mt-1">
                      <button className="hover:underline">溯源</button>
                      <button className="hover:underline text-red-500">删除</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="px-4 py-2 border-t border-slate-200 flex items-center justify-end gap-4 text-[11px] bg-slate-50 font-sans">
           <span className="text-slate-500">共 <span className="font-mono">21</span> 条</span>
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

  return (
    <div className="h-screen bg-[#f8fafc] p-3 flex flex-col overflow-hidden font-sans text-slate-800">
      <NotificationBar />
      <TabSelector activeTab={activeTab} onSelect={(t) => { setActiveTab(t); setCurrentPage(1); }} />
      <DataOverview 
        activeTab={activeTab} 
        assetSubTab={assetSubTab} 
        setAssetSubTab={setAssetSubTab}
        onToggleSearch={() => setIsSearchOpen(!isSearchOpen)} 
      />
      <SearchPanel tab={activeTab} isVisible={isSearchOpen} />
      
      {/* 资产管理 - 资产台账 视图 */}
      {activeTab === '资产管理' && assetSubTab === 'ledger' && renderAssetLedger()}

      {/* 资产管理 - 资产总览 视图 */}
      {activeTab === '资产管理' && assetSubTab === 'overview' && (
        <div className="flex-1 bg-white rounded-lg p-6 overflow-auto border border-slate-200 shadow-sm">
          <div className="grid grid-cols-5 gap-4 mb-8">
            {['21个 总资产', '6个 在用资产', '2个 租赁中资产', '11个 闲置资产', '2个 报废资产'].map(label => (
              <div key={label} className="border border-slate-200 rounded-lg p-4 text-center bg-[#fafafa]">
                <div className="text-xl font-bold font-mono text-[#1890ff] mb-1">{label.split(' ')[0]}</div>
                <div className="text-[11px] text-slate-500 font-medium font-sans">{label.split(' ')[1]}</div>
              </div>
            ))}
          </div>
          <div className="grid grid-cols-2 gap-8">
            <div className="border border-slate-100 rounded-lg p-5 flex flex-col h-[350px]">
              <div className="text-xs font-bold mb-6 text-slate-600 flex items-center gap-2 font-sans"><Activity size={14} className="text-[#1890ff]"/> 资产分类统计</div>
              <div className="flex-1 flex items-end justify-around px-8 border-b border-slate-200 pb-1">
                <div className="w-10 bg-[#1890ff] h-1/4 rounded-t relative transition-all hover:opacity-80"><span className="absolute -top-6 text-[11px] w-full text-center font-bold font-mono">4</span><div className="absolute top-full pt-2 text-[10px] w-full text-center whitespace-nowrap -translate-x-1/2 left-1/2 font-sans">办公设备</div></div>
                <div className="w-10 bg-[#1890ff] h-3/4 rounded-t relative transition-all hover:opacity-80"><span className="absolute -top-6 text-[11px] w-full text-center font-bold font-mono">15</span><div className="absolute top-full pt-2 text-[10px] w-full text-center whitespace-nowrap -translate-x-1/2 left-1/2 font-sans">软件资产</div></div>
                <div className="w-10 bg-[#1890ff] h-1/6 rounded-t relative transition-all hover:opacity-80"><span className="absolute -top-6 text-[11px] w-full text-center font-bold font-mono">2</span><div className="absolute top-full pt-2 text-[10px] w-full text-center whitespace-nowrap -translate-x-1/2 left-1/2 font-sans">其他资产</div></div>
              </div>
            </div>
            <div className="border border-slate-100 rounded-lg p-5 flex flex-col h-[350px]">
              <div className="text-xs font-bold mb-6 text-slate-600 flex items-center gap-2 font-sans"><Activity size={14} className="text-[#1890ff]"/> 资产状态分布</div>
              <div className="flex-1 flex items-center justify-center relative">
                <div className="w-40 h-40 rounded-full border-[20px] border-[#52c41a] border-r-[#f5222d] border-b-[#faad14] border-l-[#1890ff]"></div>
                <div className="absolute text-center">
                  <div className="text-lg font-bold text-slate-700 font-mono">21</div>
                  <div className="text-[10px] text-slate-400 font-sans">资产总量</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 其他 Tab 的通用表格视图 */}
      {!config.hideTable && activeTab !== '资产管理' && (
        <>
          <div className="bg-white rounded-lg shadow-sm border border-slate-200 flex-1 flex flex-col overflow-hidden">
            <div className="overflow-auto flex-1">
              <table className="w-full text-left border-collapse min-w-[2400px]">
                <thead className="sticky top-0 z-20 bg-slate-50 border-b border-slate-300">
                  <tr className="text-[11px] font-bold text-slate-800 uppercase tracking-wider font-sans">
                    <th className="px-3 py-3 text-center w-14 border-r border-slate-100 whitespace-nowrap">序号</th>
                    {config.headers.map(h => (
                      <th key={h} className="px-3 py-3 min-w-[120px] border-r border-slate-100 font-sans whitespace-nowrap">{h}</th>
                    ))}
                    <th className="px-3 py-3 w-32 text-center sticky right-0 bg-slate-50 shadow-[-4px_0_4px_rgba(0,0,0,0.02)] font-sans whitespace-nowrap">操作</th>
                  </tr>
                </thead>
                <tbody>
                  {data.map((row, idx) => (
                    <tr 
                      key={idx} 
                      className={`hover:bg-blue-50/40 transition-colors text-[11px] text-slate-600 h-11 border-b border-slate-300 ${idx % 2 === 1 ? 'bg-[#FFF0F0]' : 'bg-white'}`}
                    >
                      <td className="px-3 py-1 text-center border-r border-slate-100 font-mono">{(currentPage - 1) * pageSize + idx + 1}</td>
                      {config.headers.map(h => {
                        const isMonoField = h.includes('时间') || h.includes('日期') || h.includes('金额') || h.includes('编号') || h.includes('单号') || h.includes('UID') || h.includes('代码') || h.includes('数量') || h.includes('收款') || h.includes('业绩') || h.includes('余额') || h === '手机号码';
                        const alignRight = h.includes('金额') || h.includes('收款') || h.includes('业绩') || h.includes('余额');
                        
                        return (
                          <td key={h} className={`px-3 py-1 border-r border-slate-100 max-w-[200px] ${h !== '报销凭证' ? 'truncate' : ''} ${alignRight ? 'text-right' : ''} ${isMonoField ? 'font-mono' : 'font-sans'}`}>
                            {h === '报销凭证' ? (
                              <div className="relative group cursor-pointer flex items-center gap-1 text-[#1890ff] font-sans">
                                <ImageIcon size={14} />
                                <span>{row[h]}</span>
                                {/* 悬停预览图 */}
                                <div className={`absolute left-full ml-4 ${idx < 4 ? 'top-0 translate-y-0' : 'top-1/2 -translate-y-1/2'} z-[100] hidden group-hover:block p-4 bg-white border border-slate-200 rounded-xl shadow-2xl animate-in fade-in zoom-in-95 duration-200 min-w-[640px]`}>
                                  <div className="mb-3 flex items-center justify-between border-b pb-2 border-slate-100">
                                    <div className="flex flex-col">
                                      <span className="text-[13px] font-bold text-slate-800 font-sans">报销凭证详情预览</span>
                                      <span className="text-[10px] text-slate-400 font-mono">单号: {row['报销单编号']}</span>
                                    </div>
                                    <div className="bg-blue-50 text-[#1890ff] px-2 py-0.5 rounded text-[10px] font-medium font-sans">共 4 张图片</div>
                                  </div>
                                  <div className="grid grid-cols-2 gap-3">
                                    {[1, 2, 3, 4].map(num => (
                                      <div key={num} className="relative group/img overflow-hidden rounded-lg border border-slate-100 shadow-sm bg-slate-50 aspect-[4/3]">
                                        <img 
                                          src={`https://picsum.photos/seed/${idx + 50 + num}/400/300`} 
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
                        );
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
              <div className="flex gap-1">
                <button className="w-6 h-6 border border-slate-200 rounded flex items-center justify-center bg-white"><ChevronLeft size={12}/></button>
                <button className="w-6 h-6 border rounded font-medium bg-[#1890ff] text-white border-[#1890ff] font-mono">1</button>
                <button className="w-6 h-6 border border-slate-200 rounded flex items-center justify-center bg-white"><ChevronRight size={12}/></button>
              </div>
              <div className="flex items-center gap-1">
                <span>前往</span>
                <input type="number" defaultValue={1} className="w-8 h-6 border border-slate-200 rounded text-center font-mono" />
                <span>页</span>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

const container = document.getElementById('root');
if (container) { const root = createRoot(container); root.render(<App />); }
