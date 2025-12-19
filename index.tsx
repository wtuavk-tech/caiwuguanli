
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
  ImageIcon
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

// --- 子组件 ---

const NotificationBar = () => (
  <div className="flex items-center gap-4 mb-2 px-4 py-2 bg-[#fff7e6] border border-[#ffd591] rounded-lg shadow-sm overflow-hidden shrink-0">
    <div className="flex items-center gap-2 text-[#d46b08] shrink-0">
      <Bell size={14} className="animate-pulse" />
      <span className="text-xs font-bold">系统公告</span>
    </div>
    <div className="flex-1 overflow-hidden relative h-5 flex items-center">
      <div className="whitespace-nowrap animate-[marquee_30s_linear_infinite] flex items-center gap-8 text-[11px] text-[#d46b08]">
        <span>📢 欢迎使用业务订单管理系统，系统将于今晚进行常规维护。请各位同事提前保存数据，避免影响报销流程。</span>
      </div>
    </div>
    <style>{`@keyframes marquee { 0% { transform: translateX(100%); } 100% { transform: translateX(-100%); } }`}</style>
  </div>
);

const TabSelector = ({ activeTab, onSelect }: { activeTab: TabType, onSelect: (t: TabType) => void }) => {
  const tabs: TabType[] = ['报销补款', '报销申请', '订单垫付', '提现申请', '预支申请', '还款申请', '预支账单', '财务收支', '发票管理', '银账查询财务', '银账查询业务员', '资产管理'];
  return (
    <div className="grid grid-cols-6 gap-1 mb-2">
      {tabs.map((tab) => (
        <button
          key={tab}
          onClick={() => onSelect(tab)}
          className={`h-9 border border-slate-300 rounded-lg text-[12px] transition-all flex items-center justify-center px-2 text-center break-all leading-tight ${
            activeTab === tab ? 'bg-[#1890ff] text-white border-[#1890ff] shadow-sm' : 'bg-white text-slate-600 hover:border-blue-400 hover:text-blue-500'
          }`}
        >
          {tab}
        </button>
      ))}
    </div>
  );
};

const DataOverview = ({ onToggleSearch }: { onToggleSearch: () => void }) => (
  <div className="bg-[#f0f7ff] rounded-lg border border-[#d9d9d9] overflow-hidden flex items-center shadow-sm h-12 mb-2">
    <div className="flex items-center gap-3 px-4 flex-1">
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
  if (!isVisible && tab !== '资产管理') return null;
  if (config.search.length === 0 && tab !== '资产管理') return null;

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
  const [currentPage, setCurrentPage] = useState(1);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const pageSize = 20;

  const config = TAB_CONFIGS[activeTab];
  const data = useMemo(() => generateRows(activeTab), [activeTab]);

  return (
    <div className="h-screen bg-[#f8fafc] p-3 flex flex-col overflow-hidden font-sans text-slate-800">
      <NotificationBar />
      <TabSelector activeTab={activeTab} onSelect={(t) => { setActiveTab(t); setCurrentPage(1); }} />
      <DataOverview onToggleSearch={() => setIsSearchOpen(!isSearchOpen)} />
      <SearchPanel tab={activeTab} isVisible={isSearchOpen} />
      
      {!config.hideTable && (
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

      {activeTab === '资产管理' && (
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
    </div>
  );
};

const container = document.getElementById('root');
if (container) { const root = createRoot(container); root.render(<App />); }
