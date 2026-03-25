import React, { useEffect, useState, useCallback } from "react";
import { useSearchParams } from "react-router-dom";
import {
  makeStyles,
  shorthands,
  tokens,
  Card,
  Button,
  Input,
  Label,
  Text,
  Subtitle1,
  Caption1,
  Dialog,
  DialogSurface,
  DialogBody,
  DialogTitle,
  DialogContent,
  DialogActions,
  Spinner,
  Dropdown,
  Option,
  Textarea,
  DataGrid,
  DataGridHeader,
  DataGridHeaderCell,
  DataGridBody,
  DataGridRow,
  DataGridCell,
  TableColumnDefinition,
  createTableColumn,
} from "@fluentui/react-components";
import {
  Add24Regular,
  Search24Regular,
  LightbulbFilament24Filled,
  Edit24Regular,
  Delete24Regular,
  Dismiss24Regular,
  TextBulletListLtr20Regular,
  Grid20Regular,
} from "@fluentui/react-icons";
import { Idea, Account, Customer, Project, IdeaCategory, ideaCategoryLabels, TaskPriority, taskPriorityLabels, taskPriorityOrder } from "../types";
import {
  getIdeas,
  createIdea,
  updateIdea,
  deactivateIdea,
  getAccounts,
  getCustomers,
  getProjects,
} from "../services/dataverseService";
import { NotesTimeline } from "../components/NotesTimeline";
import { useNotification } from "../context/NotificationContext";
import { priorityToColor, priorityToBackground, colorToPriority } from "../utils/tileColors";
import TileColorPicker from "../components/TileColorPicker";

const categoryColors: Record<number, { bg: string; text: string }> = {
  468510000: { bg: "rgba(167, 139, 250, 0.15)", text: "#a78bfa" },
  468510001: { bg: "rgba(61, 214, 140, 0.15)", text: "#3dd68c" },
  468510002: { bg: "rgba(74, 158, 255, 0.15)", text: "#4a9eff" },
  468510003: { bg: "rgba(245, 158, 11, 0.15)", text: "#f59e0b" },
  468510004: { bg: "rgba(34, 211, 238, 0.15)", text: "#22d3ee" },
  468510005: { bg: "rgba(96, 165, 250, 0.15)", text: "#60a5fa" },
  468510006: { bg: "rgba(244, 114, 182, 0.15)", text: "#f472b6" },
  468510007: { bg: "rgba(156, 163, 175, 0.15)", text: "#9ca3af" },
  468510008: { bg: "rgba(107, 114, 128, 0.15)", text: "#6b7280" },
};

const renderBadge = (label: string, colors: { bg: string; text: string }) => (
  <span style={{
    display: "inline-block",
    padding: "2px 8px",
    borderRadius: "4px",
    fontSize: "12px",
    fontWeight: 500,
    backgroundColor: colors.bg,
    color: colors.text,
    whiteSpace: "nowrap",
  }}>
    {label}
  </span>
);

const categoryOptions: { value: IdeaCategory; label: string }[] = [
  { value: 468510000, label: "Copilot Studio" },
  { value: 468510001, label: "Canvas Apps" },
  { value: 468510002, label: "Model-Driven Apps" },
  { value: 468510003, label: "Power Automate" },
  { value: 468510004, label: "Power Pages" },
  { value: 468510005, label: "Azure" },
  { value: 468510006, label: "AI General" },
  { value: 468510007, label: "App General" },
  { value: 468510008, label: "Other" },
];

const priorityColors: Record<number, { bg: string; text: string }> = {
  468510000: { bg: "rgba(156, 163, 175, 0.15)", text: "#9ca3af" },
  468510001: { bg: "rgba(245, 158, 11, 0.15)", text: "#f59e0b" },
  468510002: { bg: "rgba(248, 113, 113, 0.15)", text: "#f87171" },
  468510003: { bg: "rgba(251, 146, 60, 0.15)", text: "#fb923c" },
};

const priorityShortLabels: Record<number, string> = {
  468510000: "Low",
  468510001: "Eh",
  468510002: "Top Priority",
  468510003: "High",
};

const columnSizes: Record<string, React.CSSProperties> = {
  name: { flex: "3 1 200px", minWidth: 200 },
  category: { flex: "0 0 150px", minWidth: 150 },
  account: { flex: "1.5 1 120px", minWidth: 120 },
  contact: { flex: "1.5 1 120px", minWidth: 120 },
  actions: { flex: "0 0 72px", minWidth: 72 },
};

const useStyles = makeStyles({
  container: {
    display: "flex",
    flexDirection: "column",
    ...shorthands.gap("16px"),
  },
  toolbar: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    flexWrap: "wrap",
    ...shorthands.gap("12px"),
  },
  searchBox: {
    minWidth: "280px",
  },
  card: {
    ...shorthands.padding("0px"),
    ...shorthands.borderRadius("8px"),
    overflow: "hidden",
    border: `1px solid ${tokens.colorNeutralStroke1}`,
    borderLeft: "3px solid #a78bfa",
    boxShadow: "none",
  },
  pageHeader: {
    display: "flex",
    alignItems: "center",
    ...shorthands.gap("10px"),
  },
  formGrid: {
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    ...shorthands.gap("16px"),
  },
  formField: {
    display: "flex",
    flexDirection: "column",
    ...shorthands.gap("4px"),
  },
  formFieldFull: {
    display: "flex",
    flexDirection: "column",
    ...shorthands.gap("4px"),
    gridColumn: "1 / -1",
  },
  emptyState: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    ...shorthands.padding("48px"),
    color: tokens.colorNeutralForeground3,
  },
  nameLink: {
    cursor: "pointer",
    color: tokens.colorBrandForeground1,
    ":hover": {
      textDecoration: "underline",
    },
  },
  viewField: {
    marginBottom: "16px",
  },
  viewGrid: {
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    ...shorthands.gap("16px"),
  },
  viewLayout: {
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    ...shorthands.gap("24px"),
  },
  viewDetails: {
    display: "flex",
    flexDirection: "column",
  },
  viewNotes: {
    display: "flex",
    flexDirection: "column",
  },
  tileGrid: {
    display: "flex",
    flexWrap: "wrap" as const,
    ...shorthands.gap("10px"),
  },
  tile: {
    display: "flex",
    flexDirection: "column" as const,
    alignItems: "flex-start",
    justifyContent: "space-between",
    ...shorthands.padding("12px"),
    width: "220px",
    minHeight: "120px",
    backgroundColor: tokens.colorNeutralBackground1,
    ...shorthands.borderRadius("8px"),
    border: `1px solid ${tokens.colorNeutralStroke1}`,
    cursor: "pointer",
    transition: "background-color 0.15s ease",
    ":hover": {
      backgroundColor: tokens.colorNeutralBackground1Hover,
    },
  },
  tileName: {
    fontWeight: 600,
    fontSize: "13px",
    lineHeight: "1.3",
    wordBreak: "break-word" as const,
    paddingRight: "4px",
  },
  tileMeta: {
    display: "flex",
    flexDirection: "column" as const,
    ...shorthands.gap("4px"),
    width: "100%",
    marginTop: "8px",
  },
  viewToggle: {
    display: "flex",
    ...shorthands.gap("2px"),
    backgroundColor: tokens.colorNeutralBackground3,
    ...shorthands.borderRadius("6px"),
    ...shorthands.padding("2px"),
  },
});

interface FormData {
  tdvsp_name: string;
  tdvsp_description: string;
  tdvsp_category: IdeaCategory | "";
  tdvsp_priority: TaskPriority | "";
  accountId: string;
  contactId: string;
  projectId: string;
}

const emptyForm: FormData = {
  tdvsp_name: "",
  tdvsp_description: "",
  tdvsp_category: "",
  tdvsp_priority: "",
  accountId: "",
  contactId: "",
  projectId: "",
};

export const Ideas: React.FC = () => {
  const styles = useStyles();
  const { notify } = useNotification();
  const [searchParams, setSearchParams] = useSearchParams();
  const [ideas, setIdeas] = useState<Idea[]>([]);
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [contacts, setContacts] = useState<Customer[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState<FormData>(emptyForm);
  const [viewDialogOpen, setViewDialogOpen] = useState(false);
  const [viewingIdea, setViewingIdea] = useState<Idea | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [viewMode, setViewMode] = useState<"list" | "tiles">(() =>
    (localStorage.getItem("og-ideas-view-mode") as "list" | "tiles") || "list"
  );

  const toggleViewMode = (mode: "list" | "tiles") => {
    setViewMode(mode);
    localStorage.setItem("og-ideas-view-mode", mode);
  };

  const loadIdeas = useCallback(async () => {
    setLoading(true);
    try {
      const data = await getIdeas();
      setIdeas(data);
    } catch (err) {
      console.error("Failed to load ideas:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  const loadAccounts = useCallback(async () => {
    try {
      const data = await getAccounts();
      setAccounts(data);
    } catch (err) {
      console.error("Failed to load accounts:", err);
    }
  }, []);

  const loadContacts = useCallback(async () => {
    try {
      const data = await getCustomers();
      setContacts(data);
    } catch (err) {
      console.error("Failed to load contacts:", err);
    }
  }, []);

  const loadProjects = useCallback(async () => {
    try {
      const data = await getProjects();
      setProjects(data);
    } catch (err) {
      console.error("Failed to load projects:", err);
    }
  }, []);

  useEffect(() => {
    loadIdeas();
    loadAccounts();
    loadContacts();
    loadProjects();
  }, [loadIdeas, loadAccounts, loadContacts, loadProjects]);

  useEffect(() => {
    if (searchParams.get("new") === "true") {
      setDialogOpen(true);
      setSearchParams({}, { replace: true });
    }
    const viewId = searchParams.get("view");
    if (viewId && ideas.length > 0) {
      const idea = ideas.find((i) => i.tdvsp_ideaid === viewId);
      if (idea) {
        setViewingIdea(idea);
        setViewDialogOpen(true);
        setSearchParams({}, { replace: true });
      }
    }
  }, [searchParams, setSearchParams, ideas]);

  const openNew = () => { setEditingId(null); setFormData(emptyForm); setDialogOpen(true); };
  const openView = (idea: Idea) => { setIsEditing(false); setEditingId(null); setViewingIdea(idea); setViewDialogOpen(true); };
  const openEdit = (idea: Idea) => {
    setViewingIdea(idea); setViewDialogOpen(true); setEditingId(idea.tdvsp_ideaid ?? null);
    setFormData({ tdvsp_name: idea.tdvsp_name, tdvsp_description: idea.tdvsp_description ?? "", tdvsp_category: idea.tdvsp_category ?? "", tdvsp_priority: idea.tdvsp_priority ?? "", accountId: idea.tdvsp_Account?.accountid ?? "", contactId: idea.tdvsp_Contact?.contactid ?? "", projectId: idea._tdvsp_project_value ?? "" });
    setIsEditing(true);
  };

  const buildIdeaPayload = () => {
    const payload: {
      tdvsp_name: string; tdvsp_description?: string; tdvsp_category?: IdeaCategory; tdvsp_priority?: TaskPriority;
      "tdvsp_Account@odata.bind"?: string; "tdvsp_Contact@odata.bind"?: string; "tdvsp_Project@odata.bind"?: string;
    } = {
      tdvsp_name: formData.tdvsp_name, tdvsp_description: formData.tdvsp_description || undefined, tdvsp_category: formData.tdvsp_category || undefined, tdvsp_priority: formData.tdvsp_priority || undefined,
    };
    if (formData.accountId) payload["tdvsp_Account@odata.bind"] = `/accounts(${formData.accountId})`;
    if (formData.contactId) payload["tdvsp_Contact@odata.bind"] = `/contacts(${formData.contactId})`;
    if (formData.projectId) payload["tdvsp_Project@odata.bind"] = `/tdvsp_Projects(${formData.projectId})`;
    return payload;
  };

  const handleSaveNew = async () => {
    setSaving(true);
    try { await createIdea(buildIdeaPayload()); setDialogOpen(false); setFormData(emptyForm); loadIdeas(); notify("Idea created"); }
    catch (err) { console.error("Failed to save idea:", err); notify("Failed to save idea", undefined, "error"); }
    finally { setSaving(false); }
  };

  const handleSaveEdit = async () => {
    if (!editingId) return;
    setSaving(true);
    try { await updateIdea(editingId, buildIdeaPayload()); setIsEditing(false); setEditingId(null); const updatedIdeas = await getIdeas(); setIdeas(updatedIdeas); const updated = updatedIdeas.find((i) => i.tdvsp_ideaid === viewingIdea?.tdvsp_ideaid); if (updated) setViewingIdea(updated); notify("Idea updated"); }
    catch (err) { console.error("Failed to save idea:", err); notify("Failed to save idea", undefined, "error"); }
    finally { setSaving(false); }
  };

  const handleDeactivate = async (id: string) => {
    setSaving(true);
    try { await deactivateIdea(id); loadIdeas(); notify("Idea deactivated"); }
    catch (err) { console.error("Failed to deactivate idea:", err); notify("Failed to deactivate idea", undefined, "error"); }
    finally { setSaving(false); }
  };

  const filtered = ideas.filter((idea) => {
    const q = searchQuery.toLowerCase();
    return idea.tdvsp_name?.toLowerCase().includes(q) || idea.tdvsp_description?.toLowerCase().includes(q) || idea.tdvsp_Account?.name?.toLowerCase().includes(q) || (idea.tdvsp_Contact && `${idea.tdvsp_Contact.firstname} ${idea.tdvsp_Contact.lastname}`.toLowerCase().includes(q));
  });

  const gridColumns: TableColumnDefinition<Idea>[] = [
    createTableColumn({ columnId: "name", compare: (a, b) => (a.tdvsp_name ?? "").localeCompare(b.tdvsp_name ?? ""), renderHeaderCell: () => "Name", renderCell: (item) => (<Text weight="semibold" className={styles.nameLink} onClick={() => openView(item)} style={{ display: "block", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }} title={item.tdvsp_name}>{item.tdvsp_name}</Text>) }),
    createTableColumn({ columnId: "category", compare: (a, b) => (a.tdvsp_category ?? 0) - (b.tdvsp_category ?? 0), renderHeaderCell: () => "Category", renderCell: (item) => { if (item.tdvsp_category == null) return <Text>--</Text>; const label = ideaCategoryLabels[item.tdvsp_category] ?? "--"; const colors = categoryColors[item.tdvsp_category]; return colors ? renderBadge(label, colors) : <Text>{label}</Text>; } }),
    createTableColumn({ columnId: "account", compare: (a, b) => (a.tdvsp_Account?.name ?? "").localeCompare(b.tdvsp_Account?.name ?? ""), renderHeaderCell: () => "Account", renderCell: (item) => (<Text style={{ display: "block", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }} title={item.tdvsp_Account?.name ?? ""}>{item.tdvsp_Account?.name ?? "--"}</Text>) }),
    createTableColumn({ columnId: "contact", compare: (a, b) => ((a.tdvsp_Contact?.lastname ?? "") + (a.tdvsp_Contact?.firstname ?? "")).localeCompare((b.tdvsp_Contact?.lastname ?? "") + (b.tdvsp_Contact?.firstname ?? "")), renderHeaderCell: () => "Contact", renderCell: (item) => (<Text style={{ display: "block", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{item.tdvsp_Contact ? `${item.tdvsp_Contact.firstname} ${item.tdvsp_Contact.lastname}` : "--"}</Text>) }),
    createTableColumn({ columnId: "actions", renderHeaderCell: () => "", renderCell: (item) => (<div style={{ display: "flex", gap: 4 }}><Button appearance="subtle" icon={<Edit24Regular />} size="small" title="Edit" onClick={() => openEdit(item)} /><Button appearance="subtle" icon={<Delete24Regular />} size="small" title="Deactivate" disabled={saving} onClick={() => item.tdvsp_ideaid && handleDeactivate(item.tdvsp_ideaid)} /></div>) }),
  ];

  return (
    <div className={styles.container}>
      <div className={styles.pageHeader}>
        <LightbulbFilament24Filled style={{ color: "#a78bfa", fontSize: 28 }} />
        <Subtitle1 style={{ fontFamily: "Inter, monospace", letterSpacing: "0.05em", textTransform: "lowercase" }}>ideas</Subtitle1>
      </div>
      <div className={styles.toolbar}>
        <Input className={styles.searchBox} contentBefore={<Search24Regular />} placeholder="Search ideas..." value={searchQuery} onChange={(_, d) => setSearchQuery(d.value)} />
        <div className={styles.viewToggle}>
          <Button appearance={viewMode === "list" ? "primary" : "subtle"} icon={<TextBulletListLtr20Regular />} size="small" onClick={() => toggleViewMode("list")} aria-label="List view" style={{ minWidth: "auto" }} />
          <Button appearance={viewMode === "tiles" ? "primary" : "subtle"} icon={<Grid20Regular />} size="small" onClick={() => toggleViewMode("tiles")} aria-label="Tile view" style={{ minWidth: "auto" }} />
        </div>
        <Dialog open={dialogOpen} onOpenChange={(_, d) => setDialogOpen(d.open)}>
          <Button appearance="primary" icon={<Add24Regular />} onClick={openNew}>New Idea</Button>
          <DialogSurface>
            <DialogBody>
              <DialogTitle>New Idea</DialogTitle>
              <DialogContent>
                <div className={styles.formGrid}>
                  <div className={styles.formFieldFull}><Label required>Name</Label><Input value={formData.tdvsp_name} onChange={(_, d) => setFormData({ ...formData, tdvsp_name: d.value })} placeholder="Brief title for this idea" /></div>
                  <div className={styles.formFieldFull}><Label>Description</Label><Textarea value={formData.tdvsp_description} onChange={(_, d) => setFormData({ ...formData, tdvsp_description: d.value })} placeholder="Describe the idea..." rows={4} /></div>
                  <div className={styles.formField}><Label>Category</Label><Dropdown placeholder="Select category" value={formData.tdvsp_category ? ideaCategoryLabels[formData.tdvsp_category] : ""} onOptionSelect={(_, d) => setFormData({ ...formData, tdvsp_category: d.optionValue ? (Number(d.optionValue) as IdeaCategory) : "" })}>{categoryOptions.map((cat) => (<Option key={cat.value} value={String(cat.value)}>{cat.label}</Option>))}</Dropdown></div>
                  <div className={styles.formField}><Label>Priority</Label><Dropdown placeholder="Select priority" value={formData.tdvsp_priority ? taskPriorityLabels[formData.tdvsp_priority] : ""} onOptionSelect={(_, d) => setFormData({ ...formData, tdvsp_priority: d.optionValue ? (Number(d.optionValue) as TaskPriority) : "" })}>{taskPriorityOrder.map((p) => (<Option key={p} value={String(p)}>{taskPriorityLabels[p]}</Option>))}</Dropdown></div>
                  <div className={styles.formField}><Label>Account</Label><Dropdown placeholder="Select account" value={accounts.find((a) => a.accountid === formData.accountId)?.name ?? ""} onOptionSelect={(_, d) => setFormData({ ...formData, accountId: d.optionValue ?? "" })}>{accounts.map((a) => (<Option key={a.accountid} value={a.accountid!}>{a.name}</Option>))}</Dropdown></div>
                  <div className={styles.formField}><Label>Project</Label><Dropdown placeholder="Select project" value={projects.find((p) => p.tdvsp_projectid === formData.projectId)?.tdvsp_name ?? ""} onOptionSelect={(_, d) => setFormData({ ...formData, projectId: d.optionValue ?? "" })}><Option value="" text="(None)">(None)</Option>{projects.map((p) => (<Option key={p.tdvsp_projectid} value={p.tdvsp_projectid!}>{p.tdvsp_name}</Option>))}</Dropdown></div>
                  <div className={styles.formFieldFull}><Label>Contact</Label><Dropdown placeholder="Select contact" value={contacts.find((c) => c.contactid === formData.contactId) ? `${contacts.find((c) => c.contactid === formData.contactId)!.firstname} ${contacts.find((c) => c.contactid === formData.contactId)!.lastname}` : ""} onOptionSelect={(_, d) => setFormData({ ...formData, contactId: d.optionValue ?? "" })}>{contacts.map((c) => (<Option key={c.contactid} value={c.contactid!} text={`${c.firstname} ${c.lastname}`}>{c.firstname} {c.lastname}</Option>))}</Dropdown></div>
                </div>
              </DialogContent>
              <DialogActions>
                <Button appearance="secondary" onClick={() => setDialogOpen(false)}>Cancel</Button>
                <Button appearance="primary" onClick={handleSaveNew} disabled={saving || !formData.tdvsp_name.trim()}>{saving ? <><Spinner size="tiny" /> Saving...</> : "Save"}</Button>
              </DialogActions>
            </DialogBody>
          </DialogSurface>
        </Dialog>
      </div>

      {loading ? (
        <div style={{ display: "flex", justifyContent: "center", padding: 48 }}><Spinner label="Loading ideas..." /></div>
      ) : filtered.length === 0 ? (
        <div className={styles.emptyState}>
          <LightbulbFilament24Filled style={{ fontSize: 48, color: "#a78bfa", marginBottom: 16 }} />
          <Subtitle1>No ideas found</Subtitle1>
          <Caption1 style={{ marginTop: 8 }}>Create your first idea to start tracking.</Caption1>
        </div>
      ) : viewMode === "list" ? (
        <Card className={styles.card}>
          <DataGrid items={filtered} columns={gridColumns} getRowId={(item) => item.tdvsp_ideaid ?? item.tdvsp_name} sortable>
            <DataGridHeader><DataGridRow>{({ renderHeaderCell, columnId }) => (<DataGridHeaderCell style={columnSizes[columnId as string]}>{renderHeaderCell()}</DataGridHeaderCell>)}</DataGridRow></DataGridHeader>
            <DataGridBody<Idea>>{({ item, rowId }) => (<DataGridRow<Idea> key={rowId}>{({ renderCell, columnId }) => (<DataGridCell style={columnSizes[columnId as string]}>{renderCell(item)}</DataGridCell>)}</DataGridRow>)}</DataGridBody>
          </DataGrid>
        </Card>
      ) : (
        <div className={styles.tileGrid}>
          {filtered.map((idea) => (
            <div key={idea.tdvsp_ideaid} className={`${styles.tile} tile-color-host`} onClick={() => openView(idea)} style={{ position: "relative", backgroundColor: priorityToBackground(idea.tdvsp_priority) }}>
              <TileColorPicker currentColor={priorityToColor(idea.tdvsp_priority)} onColorChange={async (color) => { try { await updateIdea(idea.tdvsp_ideaid!, { tdvsp_priority: colorToPriority(color) ?? undefined }); loadIdeas(); } catch (err) { console.error(err); } }} />
              <Text className={styles.tileName}>{idea.tdvsp_name}</Text>
              <div className={styles.tileMeta}>
                {idea.tdvsp_category != null && categoryColors[idea.tdvsp_category] && renderBadge(ideaCategoryLabels[idea.tdvsp_category as IdeaCategory] ?? "", categoryColors[idea.tdvsp_category])}
                {idea.tdvsp_Account?.name && <Caption1 style={{ color: tokens.colorNeutralForeground3 }}>{idea.tdvsp_Account.name}</Caption1>}
                {idea.tdvsp_Contact && <Caption1 style={{ color: tokens.colorNeutralForeground3 }}>{idea.tdvsp_Contact.firstname} {idea.tdvsp_Contact.lastname}</Caption1>}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* View Dialog */}
      <Dialog open={viewDialogOpen} onOpenChange={(_, d) => { setViewDialogOpen(d.open); if (!d.open) { setIsEditing(false); setEditingId(null); } }}>
        <DialogSurface style={{ maxWidth: "70vw", width: "70vw" }}>
          <DialogBody>
            <DialogTitle action={<Button appearance="subtle" icon={<Dismiss24Regular />} onClick={() => setViewDialogOpen(false)} />}>Idea Details</DialogTitle>
            <DialogContent>
              {viewingIdea && (
                <div className={styles.viewLayout}>
                  <div className={styles.viewDetails}>
                    <div className={styles.viewField}><Label>Name</Label>{isEditing ? (<Input value={formData.tdvsp_name} onChange={(_, d) => setFormData({ ...formData, tdvsp_name: d.value })} />) : (<Text block size={400} weight="semibold">{viewingIdea.tdvsp_name}</Text>)}</div>
                    <div className={styles.viewField}><Label>Description</Label>{isEditing ? (<Textarea value={formData.tdvsp_description} onChange={(_, d) => setFormData({ ...formData, tdvsp_description: d.value })} rows={4} />) : (<Text block size={400} style={{ whiteSpace: "pre-wrap" }}>{viewingIdea.tdvsp_description || "--"}</Text>)}</div>
                    <div className={styles.viewGrid}>
                      <div className={styles.viewField}><Label>Category</Label>{isEditing ? (<Dropdown placeholder="Select category" value={formData.tdvsp_category ? ideaCategoryLabels[formData.tdvsp_category] : ""} onOptionSelect={(_, d) => setFormData({ ...formData, tdvsp_category: d.optionValue ? (Number(d.optionValue) as IdeaCategory) : "" })}>{categoryOptions.map((cat) => (<Option key={cat.value} value={String(cat.value)}>{cat.label}</Option>))}</Dropdown>) : (viewingIdea.tdvsp_category != null && categoryColors[viewingIdea.tdvsp_category] ? renderBadge(ideaCategoryLabels[viewingIdea.tdvsp_category] ?? "--", categoryColors[viewingIdea.tdvsp_category]) : <Text block size={400}>--</Text>)}</div>
                      <div className={styles.viewField}><Label>Priority</Label>{isEditing ? (<Dropdown placeholder="Select priority" value={formData.tdvsp_priority ? taskPriorityLabels[formData.tdvsp_priority] : ""} onOptionSelect={(_, d) => setFormData({ ...formData, tdvsp_priority: d.optionValue ? (Number(d.optionValue) as TaskPriority) : "" })}><Option value="" text="(None)">(None)</Option>{taskPriorityOrder.map((p) => (<Option key={p} value={String(p)}>{taskPriorityLabels[p]}</Option>))}</Dropdown>) : (viewingIdea.tdvsp_priority != null && priorityColors[viewingIdea.tdvsp_priority] ? renderBadge(priorityShortLabels[viewingIdea.tdvsp_priority] ?? "--", priorityColors[viewingIdea.tdvsp_priority]) : <Text block size={400}>--</Text>)}</div>
                      <div className={styles.viewField}><Label>Account</Label>{isEditing ? (<Dropdown placeholder="Select account" value={accounts.find((a) => a.accountid === formData.accountId)?.name ?? ""} onOptionSelect={(_, d) => setFormData({ ...formData, accountId: d.optionValue ?? "" })}><Option value="" text="(None)">(None)</Option>{accounts.map((a) => (<Option key={a.accountid} value={a.accountid!}>{a.name}</Option>))}</Dropdown>) : (<Text block size={400}>{viewingIdea.tdvsp_Account?.name || "--"}</Text>)}</div>
                      <div className={styles.viewField}><Label>Project</Label>{isEditing ? (<Dropdown placeholder="Select project" value={projects.find((p) => p.tdvsp_projectid === formData.projectId)?.tdvsp_name ?? ""} onOptionSelect={(_, d) => setFormData({ ...formData, projectId: d.optionValue ?? "" })}><Option value="" text="(None)">(None)</Option>{projects.map((p) => (<Option key={p.tdvsp_projectid} value={p.tdvsp_projectid!}>{p.tdvsp_name}</Option>))}</Dropdown>) : (<Text block size={400}>{projects.find((p) => p.tdvsp_projectid === viewingIdea._tdvsp_project_value)?.tdvsp_name || "--"}</Text>)}</div>
                      <div className={styles.viewField}><Label>Contact</Label>{isEditing ? (<Dropdown placeholder="Select contact" value={contacts.find((c) => c.contactid === formData.contactId) ? `${contacts.find((c) => c.contactid === formData.contactId)!.firstname} ${contacts.find((c) => c.contactid === formData.contactId)!.lastname}` : ""} onOptionSelect={(_, d) => setFormData({ ...formData, contactId: d.optionValue ?? "" })}><Option value="" text="(None)">(None)</Option>{contacts.map((c) => (<Option key={c.contactid} value={c.contactid!} text={`${c.firstname} ${c.lastname}`}>{c.firstname} {c.lastname}</Option>))}</Dropdown>) : (<Text block size={400}>{viewingIdea.tdvsp_Contact ? `${viewingIdea.tdvsp_Contact.firstname} ${viewingIdea.tdvsp_Contact.lastname}` : "--"}</Text>)}</div>
                    </div>
                  </div>
                  <div className={styles.viewNotes}><NotesTimeline entityId={viewingIdea.tdvsp_ideaid!} entityName={viewingIdea.tdvsp_name} entityType="idea" odataBindKey="objectid_tdvsp_idea@odata.bind" entitySetPath="/tdvsp_ideas" /></div>
                </div>
              )}
            </DialogContent>
            <DialogActions>
              {isEditing ? (<><Button appearance="secondary" disabled={saving} onClick={() => setIsEditing(false)}>Cancel</Button><Button appearance="primary" onClick={handleSaveEdit} disabled={saving || !formData.tdvsp_name.trim()}>{saving ? <><Spinner size="tiny" /> Saving...</> : "Save"}</Button></>) : (<Button appearance="primary" icon={<Edit24Regular />} onClick={() => viewingIdea && openEdit(viewingIdea)}>Edit</Button>)}
            </DialogActions>
          </DialogBody>
        </DialogSurface>
      </Dialog>
    </div>
  );
};
