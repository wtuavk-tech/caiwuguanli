
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
  Calendar
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
    isRedRow: i === 4 // Simulate the red row in screenshot
  }));
};


// --- 子组件 ---

const NotificationBar = () => (
  <div className="flex items-center justify-between mb-4 px-4 py-2 bg-[#0f172a] rounded-lg shadow-md shrink-0 h-12">
    <div className="flex items-center gap-3 shrink-0">
      <span className="bg-[#ef4444] text-white text-[12px] font-bold px-2 py-1 rounded">重要公告</span>
      <Bell size={16} className="text-slate-300" />
    </div>
    <div className="flex-1 overflow-hidden relative h-6 flex items-center mx-4">
      <div className="whitespace-nowrap animate-[marquee_30s_linear_infinite] flex items-center gap-12 text-[13px] text-slate-200 font-medium">
        <span className="flex items-center gap-2">
          <Megaphone size={14} className="text-white"/> 
          关于 2025 年度秋季职业晋升评审的通知: 点击下方详情以阅读完整公告内容。请所有相关人员务必在截止日期前完成确认。
        </span>
        <span className="flex items-center gap-2">
          <Flame size={14} className="text-orange-400"/>
          界面优化: 系统视觉风格已全面升级，如有问题请联系管理员。
        </span>
      </div>
    </div>
    <div className="bg-slate-800 text-slate-400 text-[11px] font-mono px-2 py-1 rounded border border-slate-700">
      2025-11-19
    </div>
    <style>{`@keyframes marquee { 0% { transform: translateX(100%); } 100% { transform: translateX(-100%); } }`}</style>
  </div>
);

// Tab Color Definitions
const TAB_COLORS = [
  { name: 'red',    bg: 'bg-[#ef4444]', lightBg: 'bg-red-50',    border: 'border-red-500',    text: 'text-[#ef4444]' },
  { name: 'amber',  bg: 'bg-[#f59e0b]', lightBg: 'bg-amber-50',  border: 'border-amber-500',  text: 'text-[#f59e0b]' },
  { name: 'blue',   bg: 'bg-[#3b82f6]', lightBg: 'bg-blue-50',   border: 'border-blue-500',   text: 'text-[#3b82f6]' },
  { name: 'lime',   bg: 'bg-[#84cc16]', lightBg: 'bg-lime-50',   border: 'border-lime-500',   text: 'text-[#84cc16]' },
  { name: 'cyan',   bg: 'bg-[#06b6d4]', lightBg: 'bg-cyan-50',   border: 'border-cyan-500',   text: 'text-[#06b6d4]' },
  { name: 'purple', bg: 'bg-[#a855f7]', lightBg: 'bg-purple-50', border: 'border-purple-500', text: 'text-[#a855f7]' },
  { name: 'rose',   bg: 'bg-[#f43f5e]', lightBg: 'bg-rose-50',   border: 'border-rose-500',   text: 'text-[#f43f5e]' },
];

const TabSelector = ({ activeTab, onSelect }: { activeTab: TabType, onSelect: (t: TabType) => void }) => {
  const tabs: TabType[] = ['报销补款', '报销申请', '订单垫付', '提现申请', '预支申请', '还款申请', '预支账单', '财务收支', '发票管理', '银账查询财务', '银账查询业务员', '资产管理'];
  
  return (
    <div className="grid grid-cols-6 gap-3 mb-4 p-4 bg-white rounded-xl border border-slate-200 shadow-sm">
      {tabs.map((tab, idx) => {
        const theme = TAB_COLORS[idx % TAB_COLORS.length];
        const isActive = activeTab === tab;
        
        return (
          <button
            key={tab}
            onClick={() => onSelect(tab)}
            className={`
              h-10 rounded-lg text-[13px] font-bold transition-all flex items-center justify-center px-2 text-center break-all leading-tight shadow-sm
              ${isActive 
                ? `${theme.bg} text-white border-transparent shadow-md transform scale-[1.02]` 
                : `${theme.lightBg} ${theme.text} ${theme.border} border bg-opacity-60 hover:bg-opacity-100`
              }
            `}
          >
            {tab}
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
  <div className="bg-[#f0f7ff] rounded-lg border border-[#d9d9d9] overflow-hidden flex items-center shadow-sm h-12 mb-2">
    <div className="flex items-center gap-3 px-4 flex-1">
      {activeTab === '资产管理' ? (
        <div className="flex gap-4">
           <button 
             onClick={() => setAssetSubTab('overview')}
             className={`text-sm font-bold relative h-12 px-2 flex items-center ${assetSubTab === 'overview' ? 'text-[#1890ff]' : 'text-slate-600 hover:text-[#1890ff]'}`}
           >
             资产总览
             {assetSubTab === 'overview' && <div className="absolute bottom-0 left-0 w-full h-0.5 bg-[#1890ff]"></div>}
           </button>
           <button 
             onClick={() => setAssetSubTab('ledger')}
             className={`text-sm font-bold relative h-12 px-2 flex items-center ${assetSubTab === 'ledger' ? 'text-[#1890ff]' : 'text-slate-600 hover:text-[#1890ff]'}`}
           >
             资产台账
             {assetSubTab === 'ledger' && <div className="absolute bottom-0 left-0 w-full h-0.5 bg-[#1890ff]"></div>}
           </button>
        </div>
      ) : (
        <>
          <div className="flex items-center gap-2 mr-8 shrink-0">
            <Activity size={18} className="text-[#1890ff]" />
            <span className="text-sm font-bold text-[#003a8c]">数据概览</span>
          </div>
          <div className="flex gap-12">
            {[['待审核数', '12', '#262626'], ['今日已审核', '45', '#262626'], ['当月已审核', '892', '#52c41a'], ['当年已审核', '12540', '#f5222d']].map(([label, val, color]) => (
              <div key={label} className="flex items-center gap-1.5">
                <span className="text-[12px] text-[#8c8c8c]">{label}:</span>
                <span className="text-base font-bold font-mono" style={{ color }}>{val}</span>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
    <div 
      onClick={onToggleSearch}
      className="h-full px-5 bg-[#e6f7ff] border-l border-[#d9d9d9] flex items-center gap-2 text-[#1890ff] font-medium text-xs cursor-pointer hover:bg-blue-100 transition-colors"
    >
      <Search size={14} />
      <span>点这高级筛选</span>
    </div>
  </div>
);

const SearchPanel = ({ tab, isVisible }: { tab: TabType, isVisible: boolean }) => {
  const config = TAB_CONFIGS[tab];
  if (tab === '资产管理') return null; // 资产管理有自定义的搜索面板
  if (!isVisible) return null;
  if (config.search.length === 0) return null;

  const renderField = (field: string) => (
    <div key={field} className="flex items-center gap-2 min-w-[200px]">
      <span className="text-[11px] text-slate-500 shrink-0 whitespace-nowrap">{field}</span>
      {field.includes('时间') || field.includes('日期') ? (
        <div className="flex items-center gap-1 flex-1">
          <input type="date" className="flex-1 border border-slate-200 rounded h-7 px-1 text-[10px] outline-none" />
          <span className="text-slate-300">至</span>
          <input type="date" className="flex-1 border border-slate-200 rounded h-7 px-1 text-[10px] outline-none" />
        </div>
      ) : (
        <input type="text" placeholder="请输入内容" className="flex-1 border border-slate-200 rounded h-7 px-2 text-[11px] outline-none focus:border-blue-400" />
      )}
    </div>
  );

  return (
    <div className="bg-white p-4 border border-slate-200 rounded-lg shadow-sm mb-2">
      <div className="flex flex-wrap gap-x-6 gap-y-3 items-center">
        {config.search.map(renderField)}
        
        {/* 操作按钮区：紧跟在筛选项后面 */}
        <div className="flex items-center gap-2 border-l border-slate-200 pl-4 ml-2">
          <button className="h-7 px-4 bg-[#1890ff] text-white rounded text-[11px] hover:bg-blue-600 transition-colors">搜索</button>
          <button className="h-7 px-4 bg-white border border-slate-200 text-slate-600 rounded text-[11px] hover:bg-slate-50 transition-colors">重置</button>
          
          <div className="w-[1px] h-4 bg-slate-200 mx-2"></div>

          <button className="h-7 px-3 bg-[#1890ff] text-white rounded-md text-[11px] flex items-center gap-1 hover:bg-blue-600 transition-colors">
            <Plus size={14}/> 新增
          </button>
          <button className="h-7 px-3 bg-[#1890ff] text-white rounded-md text-[11px] flex items-center gap-1 hover:bg-blue-600 transition-colors">
            <FileSpreadsheet size={14}/> 导出
          </button>
          {tab === '报销补款' && (
            <button className="h-7 px-3 bg-[#1890ff] text-white rounded-md text-[11px] flex items-center gap-1 hover:bg-blue-600 transition-colors">
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
            <span className="text-[11px] text-slate-500">资产编号</span>
            <input type="text" placeholder="请输入内容" className="border border-slate-200 rounded h-7 px-2 text-[11px] w-32 outline-none focus:border-blue-400" />
          </div>
          <div className="flex items-center gap-2">
            <span className="text-[11px] text-slate-500">资产名称</span>
            <input type="text" placeholder="请输入内容" className="border border-slate-200 rounded h-7 px-2 text-[11px] w-32 outline-none focus:border-blue-400" />
          </div>
          <div className="flex items-center gap-2">
            <span className="text-[11px] text-slate-500">资产状态</span>
            <select className="border border-slate-200 rounded h-7 px-2 text-[11px] w-24 outline-none focus:border-blue-400 bg-white">
              <option>请选择</option>
              <option>在用</option>
              <option>闲置</option>
              <option>租借中</option>
            </select>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-[11px] text-slate-500">采购日期</span>
            <div className="flex items-center gap-1">
              <div className="relative">
                 <Clock size={12} className="absolute left-1 top-1.5 text-slate-300"/>
                 <input type="text" placeholder="开始日期" className="border border-slate-200 rounded h-7 pl-5 pr-2 text-[11px] w-24 outline-none focus:border-blue-400" />
              </div>
              <span className="text-slate-400">至</span>
              <input type="text" placeholder="结束日期" className="border border-slate-200 rounded h-7 px-2 text-[11px] w-24 outline-none focus:border-blue-400" />
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-[11px] text-slate-500">录入时间</span>
            <div className="flex items-center gap-1">
              <div className="relative">
                 <Clock size={12} className="absolute left-1 top-1.5 text-slate-300"/>
                 <input type="text" placeholder="开始日期" className="border border-slate-200 rounded h-7 pl-5 pr-2 text-[11px] w-24 outline-none focus:border-blue-400" />
              </div>
              <span className="text-slate-400">至</span>
              <input type="text" placeholder="结束日期" className="border border-slate-200 rounded h-7 px-2 text-[11px] w-24 outline-none focus:border-blue-400" />
            </div>
          </div>
          <button className="h-7 px-4 bg-[#1890ff] text-white rounded text-[11px] hover:bg-blue-600 transition-colors">搜索</button>
          <button className="h-7 px-4 bg-white border border-slate-200 text-slate-600 rounded text-[11px] hover:bg-slate-50 transition-colors">重置</button>
          
          <div className="w-[1px] h-4 bg-slate-200 mx-2"></div>

          <button className="h-7 px-3 bg-[#1890ff] text-white rounded text-[11px] flex items-center gap-1 hover:bg-blue-600 transition-colors">
            <Plus size={14}/> 新增
          </button>
          <button className="h-7 px-3 bg-[#52c41a] text-white rounded text-[11px] flex items-center gap-1 hover:bg-green-600 transition-colors">
            <Import size={14}/> 导入
          </button>
          <button className="h-7 px-3 bg-[#1890ff] text-white rounded text-[11px] flex items-center gap-1 hover:bg-blue-600 transition-colors">
            <FileSpreadsheet size={14}/> 导出
          </button>
        </div>
      )}

      {/* 移除了独立的按钮行，因为已经合并到上方 */}

      <div className="bg-white rounded-lg shadow-sm border border-slate-200 flex-1 flex flex-col overflow-hidden">
        <div className="overflow-auto flex-1">
          <table className="w-full text-left border-collapse min-w-[1800px]">
            <thead className="sticky top-0 z-20 bg-slate-50 border-b border-slate-200">
              <tr className="text-[11px] font-bold text-slate-500">
                <th className="px-3 py-3 border-r border-slate-100 text-center w-12">序号</th>
                <th className="px-3 py-3 border-r border-slate-100">资产编号</th>
                <th className="px-3 py-3 border-r border-slate-100">资产名称</th>
                <th className="px-3 py-3 border-r border-slate-100">资产类别</th>
                <th className="px-3 py-3 border-r border-slate-100">品牌型号</th>
                <th className="px-3 py-3 border-r border-slate-100">配置参数</th>
                <th className="px-3 py-3 border-r border-slate-100">采购日期</th>
                <th className="px-3 py-3 border-r border-slate-100 text-right">采购金额</th>
                <th className="px-3 py-3 border-r border-slate-100 text-center">发票</th>
                <th className="px-3 py-3 border-r border-slate-100 text-center">资产状态</th>
                <th className="px-3 py-3 border-r border-slate-100">归属人</th>
                <th className="px-3 py-3 border-r border-slate-100">部门</th>
                <th className="px-3 py-3 border-r border-slate-100">位置</th>
                <th className="px-3 py-3 border-r border-slate-100 text-center">图片</th>
                <th className="px-3 py-3 border-r border-slate-100">残值收入</th>
                <th className="px-3 py-3 border-r border-slate-100">备注</th>
                <th className="px-3 py-3 border-r border-slate-100">录入时间</th>
                <th className="px-3 py-3 text-center sticky right-0 bg-slate-50 shadow-[-4px_0_4px_rgba(0,0,0,0.02)]">操作</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {assetLedgerData.map((row, idx) => (
                <tr key={row.id} className={`text-[11px] text-slate-600 h-10 hover:bg-blue-50/40 transition-colors ${row.isRedRow ? 'bg-red-300 bg-opacity-50' : (idx % 2 === 1 ? 'bg-slate-50' : 'bg-white')}`}>
                  <td className="px-3 py-1 text-center border-r border-slate-100">{row.id}</td>
                  <td className="px-3 py-1 border-r border-slate-100">{row.assetNo}</td>
                  <td className="px-3 py-1 border-r border-slate-100">{row.assetName}</td>
                  <td className="px-3 py-1 border-r border-slate-100">{row.category}</td>
                  <td className="px-3 py-1 border-r border-slate-100">{row.model}</td>
                  <td className="px-3 py-1 border-r border-slate-100">{row.params}</td>
                  <td className="px-3 py-1 border-r border-slate-100">{row.purchaseDate}</td>
                  <td className="px-3 py-1 border-r border-slate-100 text-right font-mono">{row.amount.toFixed(2)}</td>
                  <td className="px-3 py-1 border-r border-slate-100 text-center"></td>
                  <td className="px-3 py-1 border-r border-slate-100 text-center">
                    <span className={`px-2 py-0.5 rounded ${
                      row.status === '在用' ? 'bg-blue-50 text-blue-500' :
                      row.status === '租借中' || row.status === '租赁' ? 'bg-orange-50 text-orange-500' :
                      'bg-slate-100 text-slate-500'
                    }`}>
                      {row.status}
                    </span>
                  </td>
                  <td className="px-3 py-1 border-r border-slate-100">{row.owner}</td>
                  <td className="px-3 py-1 border-r border-slate-100">{row.dept}</td>
                  <td className="px-3 py-1 border-r border-slate-100">{row.location}</td>
                  <td className="px-3 py-1 border-r border-slate-100 text-center">
                    {row.hasImage && (
                      <div className="inline-flex items-center justify-center relative">
                         <span className="text-[#1890ff] cursor-pointer hover:underline">图片</span>
                         {row.imageCount > 0 && (
                           <span className="absolute -top-2 -right-3 bg-red-500 text-white text-[9px] w-3.5 h-3.5 flex items-center justify-center rounded-full">{row.imageCount}</span>
                         )}
                      </div>
                    )}
                  </td>
                  <td className="px-3 py-1 border-r border-slate-100"></td>
                  <td className="px-3 py-1 border-r border-slate-100">{row.remarks}</td>
                  <td className="px-3 py-1 border-r border-slate-100">{row.entryTime}</td>
                  <td className={`px-3 py-1 text-center sticky right-0 shadow-[-4px_0_4px_rgba(0,0,0,0.02)] ${row.isRedRow ? 'bg-red-300 bg-opacity-0' : (idx % 2 === 1 ? 'bg-slate-50' : 'bg-white')}`}>
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
        <div className="px-4 py-2 border-t border-slate-200 flex items-center justify-end gap-4 text-[11px] bg-slate-50">
           <span className="text-slate-500">共 21 条</span>
           <select className="border border-slate-200 rounded h-6 text-[11px] outline-none">
             <option>10条/页</option>
             <option>20条/页</option>
           </select>
           <div className="flex gap-1">
              <button className="w-6 h-6 border border-slate-200 rounded flex items-center justify-center bg-white hover:bg-slate-50"><ChevronLeft size={12}/></button>
              <button className="w-6 h-6 border bg-[#1890ff] text-white border-[#1890ff] rounded flex items-center justify-center">1</button>
              <button className="w-6 h-6 border border-slate-200 rounded flex items-center justify-center bg-white hover:bg-slate-50">2</button>
              <button className="w-6 h-6 border border-slate-200 rounded flex items-center justify-center bg-white hover:bg-slate-50">3</button>
              <button className="w-6 h-6 border border-slate-200 rounded flex items-center justify-center bg-white hover:bg-slate-50"><ChevronRight size={12}/></button>
           </div>
           <div className="flex items-center gap-1">
              <span>前往</span>
              <input type="text" defaultValue="1" className="w-8 h-6 border border-slate-200 rounded text-center outline-none" />
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
                <div className="text-xl font-bold text-[#1890ff] mb-1">{label.split(' ')[0]}</div>
                <div className="text-[11px] text-slate-500 font-medium">{label.split(' ')[1]}</div>
              </div>
            ))}
          </div>
          <div className="grid grid-cols-2 gap-8">
            <div className="border border-slate-100 rounded-lg p-5 flex flex-col h-[350px]">
              <div className="text-xs font-bold mb-6 text-slate-600 flex items-center gap-2"><Activity size={14} className="text-[#1890ff]"/> 资产分类统计</div>
              <div className="flex-1 flex items-end justify-around px-8 border-b border-slate-200 pb-1">
                <div className="w-10 bg-[#1890ff] h-1/4 rounded-t relative transition-all hover:opacity-80"><span className="absolute -top-6 text-[11px] w-full text-center font-bold">4</span><div className="absolute top-full pt-2 text-[10px] w-full text-center whitespace-nowrap -translate-x-1/2 left-1/2">办公设备</div></div>
                <div className="w-10 bg-[#1890ff] h-3/4 rounded-t relative transition-all hover:opacity-80"><span className="absolute -top-6 text-[11px] w-full text-center font-bold">15</span><div className="absolute top-full pt-2 text-[10px] w-full text-center whitespace-nowrap -translate-x-1/2 left-1/2">软件资产</div></div>
                <div className="w-10 bg-[#1890ff] h-1/6 rounded-t relative transition-all hover:opacity-80"><span className="absolute -top-6 text-[11px] w-full text-center font-bold">2</span><div className="absolute top-full pt-2 text-[10px] w-full text-center whitespace-nowrap -translate-x-1/2 left-1/2">其他资产</div></div>
              </div>
            </div>
            <div className="border border-slate-100 rounded-lg p-5 flex flex-col h-[350px]">
              <div className="text-xs font-bold mb-6 text-slate-600 flex items-center gap-2"><Activity size={14} className="text-[#1890ff]"/> 资产状态分布</div>
              <div className="flex-1 flex items-center justify-center relative">
                <div className="w-40 h-40 rounded-full border-[20px] border-[#52c41a] border-r-[#f5222d] border-b-[#faad14] border-l-[#1890ff]"></div>
                <div className="absolute text-center">
                  <div className="text-lg font-bold text-slate-700">21</div>
                  <div className="text-[10px] text-slate-400">资产总量</div>
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
                <thead className="sticky top-0 z-20 bg-slate-50 border-b border-slate-200">
                  <tr className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                    <th className="px-3 py-3 text-center w-14 border-r border-slate-100">序号</th>
                    {config.headers.map(h => (
                      <th key={h} className="px-3 py-3 min-w-[120px] border-r border-slate-100">{h}</th>
                    ))}
                    <th className="px-3 py-3 w-32 text-center sticky right-0 bg-slate-50 shadow-[-4px_0_4px_rgba(0,0,0,0.02)]">操作</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {data.map((row, idx) => (
                    <tr 
                      key={idx} 
                      className={`hover:bg-blue-50/40 transition-colors text-[11px] text-slate-600 h-11 ${idx % 2 === 1 ? 'bg-blue-50/50' : 'bg-white'}`}
                    >
                      <td className="px-3 py-1 text-center border-r border-slate-100">{(currentPage - 1) * pageSize + idx + 1}</td>
                      {config.headers.map(h => (
                        <td key={h} className={`px-3 py-1 border-r border-slate-100 max-w-[200px] ${h !== '报销凭证' ? 'truncate' : ''} ${h.includes('金额') ? 'text-right font-mono' : ''}`}>
                          {h === '报销凭证' ? (
                            <div className="relative group cursor-pointer flex items-center gap-1 text-[#1890ff]">
                              <ImageIcon size={14} />
                              <span>{row[h]}</span>
                              {/* 悬停预览图 - idx < 4 时使用 top-0 确保不被表头挡住，且向下展示完整内容 */}
                              <div className={`absolute left-full ml-4 ${idx < 4 ? 'top-0 translate-y-0' : 'top-1/2 -translate-y-1/2'} z-[100] hidden group-hover:block p-4 bg-white border border-slate-200 rounded-xl shadow-2xl animate-in fade-in zoom-in-95 duration-200 min-w-[640px]`}>
                                <div className="mb-3 flex items-center justify-between border-b pb-2 border-slate-100">
                                  <div className="flex flex-col">
                                    <span className="text-[13px] font-bold text-slate-800">报销凭证详情预览</span>
                                    <span className="text-[10px] text-slate-400">单号: {row['报销单编号']}</span>
                                  </div>
                                  <div className="bg-blue-50 text-[#1890ff] px-2 py-0.5 rounded text-[10px] font-medium">共 4 张图片</div>
                                </div>
                                <div className="grid grid-cols-2 gap-3">
                                  {[1, 2, 3, 4].map(num => (
                                    <div key={num} className="relative group/img overflow-hidden rounded-lg border border-slate-100 shadow-sm bg-slate-50 aspect-[4/3]">
                                      <img 
                                        src={`https://picsum.photos/seed/${idx + 50 + num}/400/300`} 
                                        alt={`凭证图片 ${num}`} 
                                        className="w-full h-full object-cover transition-transform duration-500 group-hover/img:scale-105"
                                      />
                                      <div className="absolute bottom-1 right-1 bg-black/50 backdrop-blur-sm text-[9px] text-white px-1.5 py-0.5 rounded-md">图 {num}</div>
                                    </div>
                                  ))}
                                </div>
                                <div className="mt-3 pt-2 border-t border-slate-50 text-[10px] text-center text-slate-400 font-medium flex items-center justify-center gap-1">
                                  <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse"></div>
                                  <span>凭证图片预览中 - 请确保所有材料真实有效</span>
                                </div>
                              </div>
                            </div>
                          ) : (
                            row[h]
                          )}
                        </td>
                      ))}
                      <td className={`px-3 py-1 text-center sticky right-0 group-hover:bg-blue-50/40 shadow-[-4px_0_4px_rgba(0,0,0,0.02)] ${idx % 2 === 1 ? 'bg-[#f8fcff]' : 'bg-white'}`}>
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

            <div className="px-4 py-2 border-t border-slate-200 flex items-center justify-center gap-4 text-[11px] bg-slate-50">
              <span className="text-slate-500">共 {data.length} 条</span>
              <div className="flex gap-1">
                <button className="w-6 h-6 border border-slate-200 rounded flex items-center justify-center bg-white"><ChevronLeft size={12}/></button>
                <button className="w-6 h-6 border rounded font-medium bg-[#1890ff] text-white border-[#1890ff]">1</button>
                <button className="w-6 h-6 border border-slate-200 rounded flex items-center justify-center bg-white"><ChevronRight size={12}/></button>
              </div>
              <div className="flex items-center gap-1">
                <span>前往</span>
                <input type="number" defaultValue={1} className="w-8 h-6 border border-slate-200 rounded text-center" />
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
