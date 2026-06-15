import { useState, useMemo, useEffect } from "react";
import {
  Search,
  Plus,
  Download,
  Upload,
  Filter,
  ChevronRight,
  AlertTriangle,
  Pill,
  Info,
  X,
  Edit3,
  Trash2,
  ChevronDown,
  Check,
} from "lucide-react";
import { useDataStore } from "@/store/dataStore";
import { useUserStore, useDashboardStore } from "@/store/appStore";
import type { Drug, DrugCategory, Severity } from "@/types";
import { cn, formatDateTime, formatSeverity, formatDrugCategory, formatNumber } from "@/utils/format";
import { DRUG_CATEGORY_LABELS, SEVERITY_LABELS } from "@/utils/constants";

function CategoryBadge({ cat }: { cat: DrugCategory }) {
  const cls =
    cat === "NON_RESTRICTED"
      ? "badge-drug-normal"
      : cat === "RESTRICTED"
      ? "badge-drug-restricted"
      : "badge-drug-special";
  return <span className={cls}>{formatDrugCategory(cat)}</span>;
}

function SeverityDot({ s }: { s: Severity }) {
  const bg =
    s === "CRITICAL" ? "bg-red-500" : s === "HIGH" ? "bg-orange-500" : s === "MEDIUM" ? "bg-amber-400" : "bg-blue-400";
  return (
    <div className="inline-flex items-center gap-1.5" title={`警示等级: ${formatSeverity(s)}`}>
      <span className={cn("w-2 h-2 rounded-full", bg)} />
      <span className="text-xs text-slate-500">{formatSeverity(s)}</span>
    </div>
  );
}

function DrugDetailDrawer({ drug, onClose, onEdit }: { drug: Drug | null; onClose: () => void; onEdit: (drug: Drug) => void }) {
  if (!drug) return null;
  return (
    <>
      <div className="fixed inset-0 bg-navy-700/20 backdrop-blur-sm z-40 animate-fade-in" onClick={onClose} />
      <div className="fixed top-0 right-0 bottom-0 w-[560px] bg-white z-50 shadow-2xl overflow-y-auto animate-slide-in-right">
        <div className="sticky top-0 z-10 bg-white/90 backdrop-blur border-b border-border px-6 py-4 flex items-start justify-between">
          <div className="pr-4">
            <div className="flex items-center gap-2 mb-2">
              <CategoryBadge cat={drug.category} />
              <SeverityDot s={drug.warningLevel} />
            </div>
            <h2 className="font-display text-2xl text-navy-700 tracking-tight">{drug.name}</h2>
            <p className="text-sm text-slate-500 mt-0.5">
              {drug.genericName} · {drug.specification}
            </p>
          </div>
          <button className="btn-ghost p-2" onClick={onClose}>
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-5">
          <div className="grid grid-cols-2 gap-4">
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/60">
              <div className="text-[11px] uppercase tracking-wider text-slate-400 font-semibold mb-1">生产厂家</div>
              <div className="text-sm font-medium text-slate-800">{drug.manufacturer}</div>
            </div>
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/60">
              <div className="text-[11px] uppercase tracking-wider text-slate-400 font-semibold mb-1">DDD 值</div>
              <div className="text-sm font-medium text-slate-800">
                <span className="data-number text-lg font-bold text-teal-700">{formatNumber(drug.dddValue, 2)}</span>{" "}
                <span className="text-xs text-slate-500">{drug.dddUnit}</span>
              </div>
            </div>
          </div>

          <div className="card p-5">
            <div className="flex items-center gap-2 mb-3">
              <div className="w-8 h-8 rounded-lg bg-emerald-50 flex items-center justify-center">
                <Info className="w-4 h-4 text-emerald-600" />
              </div>
              <h3 className="text-sm font-semibold text-slate-800">适应症</h3>
            </div>
            <p className="text-sm text-slate-600 leading-relaxed">{drug.indication}</p>
          </div>

          <div className="card p-5 border-l-4 border-l-red-400">
            <div className="flex items-center gap-2 mb-3">
              <div className="w-8 h-8 rounded-lg bg-red-50 flex items-center justify-center">
                <AlertTriangle className="w-4 h-4 text-red-600" />
              </div>
              <h3 className="text-sm font-semibold text-slate-800">禁忌症</h3>
            </div>
            <p className="text-sm text-slate-600 leading-relaxed">{drug.contraindication}</p>
          </div>

          <div className="card p-5">
            <div className="flex items-center gap-2 mb-3">
              <div className="w-8 h-8 rounded-lg bg-teal-50 flex items-center justify-center">
                <Pill className="w-4 h-4 text-teal-600" />
              </div>
              <h3 className="text-sm font-semibold text-slate-800">用法用量</h3>
            </div>
            <p className="text-sm text-slate-600 leading-relaxed">{drug.dosage}</p>
          </div>

          <div className="p-4 rounded-xl bg-navy-50/50 border border-navy-100">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-[11px] text-slate-500">最近更新</div>
                <div className="text-sm font-medium text-slate-700 mt-0.5">{formatDateTime(drug.updatedAt)}</div>
              </div>
              <div className="flex items-center gap-2">
                <button className="btn-outline btn-sm" onClick={() => onEdit(drug)}>
                  <Edit3 className="w-3.5 h-3.5" />
                  编辑
                </button>
                <button className="btn-sm" style={{ background: "#0F2C59", color: "#fff" }}>
                  导出说明书
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

const EMPTY_FORM: Omit<Drug, "id" | "updatedAt"> = {
  name: "",
  genericName: "",
  specification: "",
  category: "NON_RESTRICTED",
  manufacturer: "",
  indication: "",
  contraindication: "",
  dosage: "",
  warningLevel: "LOW",
  dddValue: 0,
  dddUnit: "mg",
};

function getFormDataFromDrug(drug: Drug): Omit<Drug, "id" | "updatedAt"> {
  return {
    name: drug.name,
    genericName: drug.genericName,
    specification: drug.specification,
    category: drug.category,
    manufacturer: drug.manufacturer,
    indication: drug.indication,
    contraindication: drug.contraindication,
    dosage: drug.dosage,
    warningLevel: drug.warningLevel,
    dddValue: drug.dddValue,
    dddUnit: drug.dddUnit,
  };
}

function DrugFormModal({
  open,
  mode,
  initialDrug,
  onClose,
  onSave,
}: {
  open: boolean;
  mode: "add" | "edit";
  initialDrug: Drug | null;
  onClose: () => void;
  onSave: (data: Omit<Drug, "id" | "updatedAt">) => void;
}) {
  const [formData, setFormData] = useState<Omit<Drug, "id" | "updatedAt">>(EMPTY_FORM);

  useEffect(() => {
    if (open) {
      if (mode === "edit" && initialDrug) {
        setFormData(getFormDataFromDrug(initialDrug));
      } else {
        setFormData(EMPTY_FORM);
      }
    }
  }, [open, mode, initialDrug]);

  if (!open) return null;

  return (
    <>
      <div className="fixed inset-0 bg-navy-700/20 backdrop-blur-sm z-40 animate-fade-in" onClick={onClose} />
      <div className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[640px] max-h-[90vh] bg-white z-50 shadow-2xl rounded-2xl overflow-hidden animate-zoom-in">
        <div className="sticky top-0 z-10 bg-white border-b border-border px-6 py-4 flex items-start justify-between">
          <div>
            <h2 className="font-display text-xl text-navy-700">
              {mode === "add" ? "新增药品" : "编辑药品"}
            </h2>
            <p className="text-sm text-slate-500 mt-1">
              {mode === "add" ? "请填写药品基本信息" : "修改药品信息，点击保存生效"}
            </p>
          </div>
          <button className="btn-ghost p-2" onClick={onClose}>
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 overflow-y-auto max-h-[calc(90vh-140px)]">
          <div className="space-y-5">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">药品名称 *</label>
                <input
                  type="text"
                  className="form-input"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="如：阿莫西林胶囊"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">通用名 *</label>
                <input
                  type="text"
                  className="form-input"
                  value={formData.genericName}
                  onChange={(e) => setFormData({ ...formData, genericName: e.target.value })}
                  placeholder="如：阿莫西林"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">规格 *</label>
                <input
                  type="text"
                  className="form-input"
                  value={formData.specification}
                  onChange={(e) => setFormData({ ...formData, specification: e.target.value })}
                  placeholder="如：0.5g×24粒"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">生产厂家 *</label>
                <input
                  type="text"
                  className="form-input"
                  value={formData.manufacturer}
                  onChange={(e) => setFormData({ ...formData, manufacturer: e.target.value })}
                  placeholder="如：华北制药股份有限公司"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">药品分级 *</label>
                <select
                  className="form-input"
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value as DrugCategory })}
                >
                  {(Object.keys(DRUG_CATEGORY_LABELS) as DrugCategory[]).map((c) => (
                    <option key={c} value={c}>{DRUG_CATEGORY_LABELS[c]}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">警示等级 *</label>
                <select
                  className="form-input"
                  value={formData.warningLevel}
                  onChange={(e) => setFormData({ ...formData, warningLevel: e.target.value as Severity })}
                >
                  {(Object.keys(SEVERITY_LABELS) as Severity[]).map((s) => (
                    <option key={s} value={s}>{SEVERITY_LABELS[s]}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">DDD 值 *</label>
                <input
                  type="number"
                  step="0.01"
                  className="form-input"
                  value={formData.dddValue}
                  onChange={(e) => setFormData({ ...formData, dddValue: parseFloat(e.target.value) || 0 })}
                  placeholder="如：1.0"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">DDD 单位 *</label>
                <input
                  type="text"
                  className="form-input"
                  value={formData.dddUnit}
                  onChange={(e) => setFormData({ ...formData, dddUnit: e.target.value })}
                  placeholder="如：mg、g"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">适应症 *</label>
              <textarea
                className="form-input min-h-[80px]"
                value={formData.indication}
                onChange={(e) => setFormData({ ...formData, indication: e.target.value })}
                placeholder="请输入适应症说明"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">禁忌症 *</label>
              <textarea
                className="form-input min-h-[80px]"
                value={formData.contraindication}
                onChange={(e) => setFormData({ ...formData, contraindication: e.target.value })}
                placeholder="请输入禁忌症说明"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">用法用量 *</label>
              <textarea
                className="form-input min-h-[80px]"
                value={formData.dosage}
                onChange={(e) => setFormData({ ...formData, dosage: e.target.value })}
                placeholder="请输入用法用量说明"
              />
            </div>
          </div>
        </div>

        <div className="sticky bottom-0 bg-white border-t border-border px-6 py-4 flex items-center justify-end gap-3">
          <button className="btn-outline" onClick={onClose}>
            取消
          </button>
          <button
            className="btn-primary"
            onClick={() => {
              onSave(formData);
            }}
          >
            <Check className="w-4 h-4" />
            保存
          </button>
        </div>
      </div>
    </>
  );
}

function ConfirmModal({
  open,
  title,
  description,
  confirmText,
  cancelText,
  onConfirm,
  onCancel,
  danger,
}: {
  open: boolean;
  title: string;
  description: string;
  confirmText?: string;
  cancelText?: string;
  onConfirm: () => void;
  onCancel: () => void;
  danger?: boolean;
}) {
  if (!open) return null;
  return (
    <>
      <div className="fixed inset-0 bg-navy-700/20 backdrop-blur-sm z-40 animate-fade-in" onClick={onCancel} />
      <div className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[440px] bg-white z-50 shadow-2xl rounded-2xl overflow-hidden animate-zoom-in">
        <div className="p-6">
          <h3 className="font-display text-lg text-navy-700 mb-2">{title}</h3>
          <p className="text-sm text-slate-600">{description}</p>
        </div>
        <div className="bg-slate-50 px-6 py-4 flex items-center justify-end gap-3">
          <button className="btn-outline btn-sm" onClick={onCancel}>
            {cancelText || "取消"}
          </button>
          <button
            className={cn("btn-sm", danger ? "btn-danger" : "btn-primary")}
            onClick={onConfirm}
          >
            {confirmText || "确认"}
          </button>
        </div>
      </div>
    </>
  );
}

function BatchUpdateModal({
  open,
  count,
  onClose,
  onConfirm,
}: {
  open: boolean;
  count: number;
  onClose: () => void;
  onConfirm: (changes: Partial<Drug>) => void;
}) {
  const [category, setCategory] = useState<DrugCategory | "">("");
  const [warningLevel, setWarningLevel] = useState<Severity | "">("");

  if (!open) return null;

  const handleConfirm = () => {
    const changes: Partial<Drug> = {};
    if (category) changes.category = category as DrugCategory;
    if (warningLevel) changes.warningLevel = warningLevel as Severity;
    if (Object.keys(changes).length > 0) {
      onConfirm(changes);
    }
    setCategory("");
    setWarningLevel("");
  };

  return (
    <>
      <div className="fixed inset-0 bg-navy-700/20 backdrop-blur-sm z-40 animate-fade-in" onClick={onClose} />
      <div className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[480px] bg-white z-50 shadow-2xl rounded-2xl overflow-hidden animate-zoom-in">
        <div className="sticky top-0 z-10 bg-white border-b border-border px-6 py-4 flex items-start justify-between">
          <div>
            <h2 className="font-display text-xl text-navy-700">批量调整分级</h2>
            <p className="text-sm text-slate-500 mt-1">已选择 {count} 个药品，选择要调整的字段</p>
          </div>
          <button className="btn-ghost p-2" onClick={onClose}>
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-5">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">药品分级</label>
            <select
              className="form-input"
              value={category}
              onChange={(e) => setCategory(e.target.value as DrugCategory | "")}
            >
              <option value="">不修改</option>
              {(Object.keys(DRUG_CATEGORY_LABELS) as DrugCategory[]).map((c) => (
                <option key={c} value={c}>{DRUG_CATEGORY_LABELS[c]}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">警示等级</label>
            <select
              className="form-input"
              value={warningLevel}
              onChange={(e) => setWarningLevel(e.target.value as Severity | "")}
            >
              <option value="">不修改</option>
              {(Object.keys(SEVERITY_LABELS) as Severity[]).map((s) => (
                <option key={s} value={s}>{SEVERITY_LABELS[s]}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="bg-slate-50 px-6 py-4 flex items-center justify-end gap-3">
          <button className="btn-outline btn-sm" onClick={onClose}>
            取消
          </button>
          <button
            className="btn-primary btn-sm"
            onClick={handleConfirm}
            disabled={!category && !warningLevel}
          >
            确认调整
          </button>
        </div>
      </div>
    </>
  );
}

export default function CatalogPage() {
  const drugs = useDataStore((s) => s.drugs);
  const { addDrug, updateDrug, deleteDrug, batchUpdateDrugs, resetDrugs, getDrugCounts } = useDataStore();

  const [activeCat, setActiveCat] = useState<"ALL" | DrugCategory>("ALL");
  const [keyword, setKeyword] = useState("");
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [detailDrug, setDetailDrug] = useState<Drug | null>(null);
  const [showSeverityFilter, setShowSeverityFilter] = useState(false);
  const [severityFilter, setSeverityFilter] = useState<Severity[]>([]);

  const [modalOpen, setModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<"add" | "edit">("add");
  const [editingDrug, setEditingDrug] = useState<Drug | null>(null);

  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [deletingDrugId, setDeletingDrugId] = useState<string | null>(null);
  const [batchDeleteMode, setBatchDeleteMode] = useState(false);

  const [batchModalOpen, setBatchModalOpen] = useState(false);
  const [resetModalOpen, setResetModalOpen] = useState(false);

  const drugCounts = useMemo(() => getDrugCounts(), [getDrugCounts]);

  const CATEGORIES = useMemo(
    () => [
      { key: "ALL" as const, label: "全部", count: drugCounts.ALL },
      { key: "NON_RESTRICTED" as const, label: "非限制级", count: drugCounts.NON_RESTRICTED },
      { key: "RESTRICTED" as const, label: "限制级", count: drugCounts.RESTRICTED },
      { key: "SPECIAL" as const, label: "特殊级", count: drugCounts.SPECIAL },
    ],
    [drugCounts]
  );

  const filtered = useMemo(() => {
    return drugs.filter((d) => {
      if (activeCat !== "ALL" && d.category !== activeCat) return false;
      if (severityFilter.length && !severityFilter.includes(d.warningLevel)) return false;
      if (keyword) {
        const k = keyword.toLowerCase();
        if (
          !d.name.toLowerCase().includes(k) &&
          !d.genericName.toLowerCase().includes(k) &&
          !d.specification.toLowerCase().includes(k) &&
          !d.manufacturer.toLowerCase().includes(k)
        )
          return false;
      }
      return true;
    });
  }, [drugs, activeCat, keyword, severityFilter]);

  const currentDetailDrug = useMemo(() => {
    if (!detailDrug) return null;
    return drugs.find((d) => d.id === detailDrug.id) || detailDrug;
  }, [detailDrug, drugs]);

  const toggleSelect = (id: string) => {
    setSelected((s) => {
      const n = new Set(s);
      if (n.has(id)) {
        n.delete(id);
      } else {
        n.add(id);
      }
      return n;
    });
  };

  const allSelected = filtered.length > 0 && filtered.every((d) => selected.has(d.id));

  const refreshStores = () => {
    useUserStore.getState().refreshTodos();
    useDashboardStore.getState().refreshStats();
  };

  const handleAddDrug = () => {
    setModalMode("add");
    setEditingDrug(null);
    setModalOpen(true);
  };

  const handleEditDrug = (drug: Drug) => {
    setModalMode("edit");
    setEditingDrug(drug);
    setModalOpen(true);
    if (detailDrug?.id === drug.id) {
      setDetailDrug(null);
    }
  };

  const handleSaveDrug = (data: Omit<Drug, "id" | "updatedAt">) => {
    if (modalMode === "add") {
      addDrug(data);
    } else if (modalMode === "edit" && editingDrug) {
      updateDrug(editingDrug.id, data);
    }
    refreshStores();
    setModalOpen(false);
    setEditingDrug(null);
  };

  const handleDeleteClick = (id: string) => {
    setDeletingDrugId(id);
    setBatchDeleteMode(false);
    setDeleteModalOpen(true);
  };

  const handleBatchDeleteClick = () => {
    setBatchDeleteMode(true);
    setDeleteModalOpen(true);
  };

  const handleConfirmDelete = () => {
    if (batchDeleteMode) {
      selected.forEach((id) => deleteDrug(id));
      setSelected(new Set());
    } else if (deletingDrugId) {
      deleteDrug(deletingDrugId);
      if (detailDrug?.id === deletingDrugId) {
        setDetailDrug(null);
      }
    }
    refreshStores();
    setDeleteModalOpen(false);
    setDeletingDrugId(null);
  };

  const handleBatchUpdate = (changes: Partial<Drug>) => {
    batchUpdateDrugs(Array.from(selected), changes);
    refreshStores();
    setBatchModalOpen(false);
  };

  const handleReset = () => {
    resetDrugs();
    refreshStores();
    setResetModalOpen(false);
    setSelected(new Set());
  };

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between gap-4">
        <div className="tab-list">
          {CATEGORIES.map((c) => (
            <button
              key={c.key}
              onClick={() => setActiveCat(c.key)}
              className={cn("tab-item inline-flex items-center gap-2", activeCat === c.key && "tab-item-active")}
            >
              {c.label}
              <span className={cn("data-number text-[11px] px-1.5 py-0.5 rounded", activeCat === c.key ? "bg-navy-500/10 text-navy-700" : "bg-white/60 text-slate-400")}>
                {c.count}
              </span>
            </button>
          ))}
        </div>
        <div className="flex items-center gap-2">
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={keyword}
              onChange={(e) => setKeyword(e.target.value)}
              placeholder="搜索药品名称、通用名、规格..."
              className="form-input w-80 pl-9"
            />
          </div>
          <div className="relative">
            <button className="btn-outline" onClick={() => setShowSeverityFilter(!showSeverityFilter)}>
              <Filter className="w-4 h-4" />
              警示等级
              <ChevronDown className="w-3.5 h-3.5" />
              {severityFilter.length > 0 && (
                <span className="ml-1 data-number text-[10px] px-1.5 rounded bg-teal-500 text-white">
                  {severityFilter.length}
                </span>
              )}
            </button>
            {showSeverityFilter && (
              <div className="absolute right-0 top-full mt-2 w-48 popover z-20">
                {(Object.keys(SEVERITY_LABELS) as Severity[]).map((s) => (
                  <label
                    key={s}
                    className="flex items-center gap-2 p-2 rounded-lg cursor-pointer hover:bg-slate-50"
                  >
                    <input
                      type="checkbox"
                      checked={severityFilter.includes(s)}
                      onChange={(e) =>
                        setSeverityFilter((fs) =>
                          e.target.checked ? [...fs, s] : fs.filter((x) => x !== s)
                        )
                      }
                      className="rounded text-teal-600 focus:ring-teal-500"
                    />
                    <SeverityDot s={s} />
                  </label>
                ))}
              </div>
            )}
          </div>
          <div className="h-8 w-px bg-border mx-1" />
          <button className="btn-outline">
            <Upload className="w-4 h-4" />
            导入
          </button>
          <button className="btn-outline">
            <Download className="w-4 h-4" />
            导出
          </button>
          <button className="btn-outline" onClick={() => setResetModalOpen(true)}>
            重置
          </button>
          <button className="btn-primary" onClick={handleAddDrug}>
            <Plus className="w-4 h-4" />
            新增药品
          </button>
        </div>
      </div>

      {selected.size > 0 && (
        <div className="card p-4 flex items-center justify-between bg-teal-50/40 border-teal-200 animate-fade-in">
          <div className="text-sm text-slate-700">
            已选择 <span className="data-number font-bold text-navy-700">{selected.size}</span> 个药品
          </div>
          <div className="flex items-center gap-2">
            <button className="btn-outline btn-sm" onClick={() => setBatchModalOpen(true)}>批量调整分级</button>
            <button className="btn-outline btn-sm">批量设置警示规则</button>
            <button className="btn-danger btn-sm" onClick={handleBatchDeleteClick}>删除</button>
            <button
              className="btn-ghost btn-sm"
              onClick={() => setSelected(new Set())}
            >
              取消选择
            </button>
          </div>
        </div>
      )}

      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="data-table">
            <thead>
              <tr>
                <th className="w-12 pl-5">
                  <input
                    type="checkbox"
                    checked={allSelected}
                    onChange={(e) =>
                      setSelected(e.target.checked ? new Set(filtered.map((d) => d.id)) : new Set())
                    }
                    className="rounded text-teal-600 focus:ring-teal-500"
                  />
                </th>
                <th className="w-14 text-slate-400">#</th>
                <th>药品名称</th>
                <th>规格</th>
                <th>生产厂家</th>
                <th>分级</th>
                <th>警示等级</th>
                <th>DDD值</th>
                <th>更新时间</th>
                <th className="w-20 pr-5 text-right">操作</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((d, i) => (
                <tr
                  key={d.id}
                  className={cn("cursor-pointer group", selected.has(d.id) && "bg-teal-50/40 hover:bg-teal-50/60!")}
                  onClick={() => setDetailDrug(d)}
                >
                  <td className="pl-5" onClick={(e) => e.stopPropagation()}>
                    <input
                      type="checkbox"
                      checked={selected.has(d.id)}
                      onChange={() => toggleSelect(d.id)}
                      className="rounded text-teal-600 focus:ring-teal-500"
                    />
                  </td>
                  <td className="data-number text-xs text-slate-400">{String(i + 1).padStart(2, "0")}</td>
                  <td>
                    <div className="flex items-center gap-2.5">
                      <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-slate-100 to-slate-200 flex items-center justify-center group-hover:from-teal-50 group-hover:to-teal-100 transition-colors">
                        <Pill className="w-4 h-4 text-slate-500 group-hover:text-teal-600" />
                      </div>
                      <div>
                        <div className="font-medium text-slate-800 group-hover:text-navy-700">{d.name}</div>
                        <div className="text-xs text-slate-400">{d.genericName}</div>
                      </div>
                    </div>
                  </td>
                  <td className="text-slate-600">{d.specification}</td>
                  <td className="text-slate-600">{d.manufacturer}</td>
                  <td>
                    <CategoryBadge cat={d.category} />
                  </td>
                  <td>
                    <SeverityDot s={d.warningLevel} />
                  </td>
                  <td>
                    <span className="data-number font-medium text-slate-700">
                      {formatNumber(d.dddValue, d.dddUnit === "mg" ? 0 : 2)}
                    </span>
                    <span className="text-xs text-slate-400 ml-1">{d.dddUnit}</span>
                  </td>
                  <td className="text-xs text-slate-500">{formatDateTime(d.updatedAt)}</td>
                  <td className="pr-5 text-right" onClick={(e) => e.stopPropagation()}>
                    <div className="inline-flex items-center opacity-0 group-hover:opacity-100 transition-opacity">
                      <button className="p-1.5 rounded hover:bg-slate-100 text-slate-500 hover:text-teal-600" onClick={() => handleEditDrug(d)}>
                        <Edit3 className="w-4 h-4" />
                      </button>
                      <button className="p-1.5 rounded hover:bg-slate-100 text-slate-500 hover:text-red-600" onClick={() => handleDeleteClick(d.id)}>
                        <Trash2 className="w-4 h-4" />
                      </button>
                      <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-teal-500 group-hover:translate-x-0.5 transition-all" />
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {filtered.length === 0 && (
          <div className="py-24 text-center">
            <div className="text-5xl mb-3">💊</div>
            <div className="text-sm text-slate-500">暂无匹配的药品记录</div>
          </div>
        )}

        <div className="px-5 py-4 border-t border-border flex items-center justify-between bg-slate-50/50">
          <div className="text-xs text-slate-500">
            共 <span className="data-number font-semibold text-slate-700">{filtered.length}</span> 条记录
          </div>
          <div className="inline-flex items-center gap-1">
            <button className="btn-ghost btn-sm">上一页</button>
            <button className="btn-sm" style={{ background: "#0F2C59", color: "#fff" }}>1</button>
            <button className="btn-ghost btn-sm">2</button>
            <button className="btn-ghost btn-sm">3</button>
            <span className="text-slate-300 px-1">...</span>
            <button className="btn-ghost btn-sm">下一页</button>
          </div>
        </div>
      </div>

      <DrugDetailDrawer drug={currentDetailDrug} onClose={() => setDetailDrug(null)} onEdit={handleEditDrug} />

      <DrugFormModal
        open={modalOpen}
        mode={modalMode}
        initialDrug={editingDrug}
        onClose={() => {
          setModalOpen(false);
          setEditingDrug(null);
        }}
        onSave={handleSaveDrug}
      />

      <ConfirmModal
        open={deleteModalOpen}
        title={batchDeleteMode ? "确认批量删除" : "确认删除"}
        description={
          batchDeleteMode
            ? `确定要删除选中的 ${selected.size} 个药品吗？此操作不可恢复。`
            : "确定要删除该药品吗？此操作不可恢复。"
        }
        confirmText="删除"
        onConfirm={handleConfirmDelete}
        onCancel={() => {
          setDeleteModalOpen(false);
          setDeletingDrugId(null);
        }}
        danger
      />

      <BatchUpdateModal
        open={batchModalOpen}
        count={selected.size}
        onClose={() => setBatchModalOpen(false)}
        onConfirm={handleBatchUpdate}
      />

      <ConfirmModal
        open={resetModalOpen}
        title="确认重置"
        description="确定要将药品数据重置为初始状态吗？所有修改将丢失。"
        confirmText="重置"
        onConfirm={handleReset}
        onCancel={() => setResetModalOpen(false)}
        danger
      />
    </div>
  );
}
