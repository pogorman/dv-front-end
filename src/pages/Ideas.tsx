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
  Body1,
  Caption1,
  Divider,
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
} from "@fluentui/react-components";
import {
  Add24Regular,
  Search24Regular,
  Lightbulb24Filled,
  Edit24Regular,
  Delete24Regular,
  Dismiss24Regular,
} from "@fluentui/react-icons";
import { Idea, Account, Customer, IdeaCategory, ideaCategoryLabels } from "../types";
import {
  getIdeas,
  createIdea,
  updateIdea,
  deleteIdea,
  getAccounts,
  getCustomers,
} from "../services/dataverseService";
import { NotesTimeline } from "../components/NotesTimeline";
import { useNotification } from "../context/NotificationContext";

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
  grid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fill, minmax(340px, 1fr))",
    ...shorthands.gap("16px"),
  },
  ideaCard: {
    ...shorthands.padding("16px"),
    ...shorthands.borderRadius("8px"),
    border: `1px solid ${tokens.colorNeutralStroke1}`,
    boxShadow: "none",
    height: "200px",
    display: "flex",
    flexDirection: "column",
    transition: "background-color 0.15s ease",
    ":hover": {
      backgroundColor: tokens.colorNeutralBackground1Hover,
    },
  },
  cardBody: {
    flexGrow: 1,
    overflowY: "auto" as const,
    minHeight: 0,
  },
  cardHeader: {
    display: "flex",
    alignItems: "flex-start",
    justifyContent: "space-between",
    marginBottom: "12px",
  },
  cardMeta: {
    display: "flex",
    alignItems: "center",
    ...shorthands.gap("16px"),
    marginTop: "12px",
    color: tokens.colorNeutralForeground3,
  },
  metaItem: {
    display: "flex",
    alignItems: "center",
    ...shorthands.gap("4px"),
  },
  categoryBadge: {
    ...shorthands.padding("2px", "8px"),
    ...shorthands.borderRadius("4px"),
    backgroundColor: tokens.colorBrandBackground2,
    color: tokens.colorBrandForeground2,
    fontSize: "12px",
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
});

interface FormData {
  tdvsp_name: string;
  tdvsp_description: string;
  tdvsp_category: IdeaCategory | "";
  accountId: string;
  contactId: string;
}

const emptyForm: FormData = {
  tdvsp_name: "",
  tdvsp_description: "",
  tdvsp_category: "",
  accountId: "",
  contactId: "",
};

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

export const Ideas: React.FC = () => {
  const styles = useStyles();
  const { notify } = useNotification();
  const [searchParams, setSearchParams] = useSearchParams();
  const [ideas, setIdeas] = useState<Idea[]>([]);
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [contacts, setContacts] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState<FormData>(emptyForm);
  const [viewDialogOpen, setViewDialogOpen] = useState(false);
  const [viewingIdea, setViewingIdea] = useState<Idea | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [saving, setSaving] = useState(false);

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

  useEffect(() => {
    loadIdeas();
    loadAccounts();
    loadContacts();
  }, [loadIdeas, loadAccounts, loadContacts]);

  // Auto-open new dialog if ?new=true, or view dialog if ?view=<id>
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

  const openNew = () => {
    setEditingId(null);
    setFormData(emptyForm);
    setDialogOpen(true);
  };

  const openView = (idea: Idea) => {
    setIsEditing(false);
    setEditingId(null);
    setViewingIdea(idea);
    setViewDialogOpen(true);
  };

  const openEdit = (idea: Idea) => {
    setViewingIdea(idea);
    setViewDialogOpen(true);
    setEditingId(idea.tdvsp_ideaid ?? null);
    setFormData({
      tdvsp_name: idea.tdvsp_name,
      tdvsp_description: idea.tdvsp_description ?? "",
      tdvsp_category: idea.tdvsp_category ?? "",
      accountId: idea.tdvsp_Account?.accountid ?? "",
      contactId: idea.tdvsp_Contact?.contactid ?? "",
    });
    setIsEditing(true);
  };

  const buildIdeaPayload = () => {
    const payload: {
      tdvsp_name: string;
      tdvsp_description?: string;
      tdvsp_category?: IdeaCategory;
      "tdvsp_Account@odata.bind"?: string;
      "tdvsp_Contact@odata.bind"?: string;
    } = {
      tdvsp_name: formData.tdvsp_name,
      tdvsp_description: formData.tdvsp_description || undefined,
      tdvsp_category: formData.tdvsp_category || undefined,
    };
    if (formData.accountId) {
      payload["tdvsp_Account@odata.bind"] = `/accounts(${formData.accountId})`;
    }
    if (formData.contactId) {
      payload["tdvsp_Contact@odata.bind"] = `/contacts(${formData.contactId})`;
    }
    return payload;
  };

  const handleSaveNew = async () => {
    setSaving(true);
    try {
      await createIdea(buildIdeaPayload());
      setDialogOpen(false);
      setFormData(emptyForm);
      loadIdeas();
      notify("Idea created");
    } catch (err) {
      console.error("Failed to save idea:", err);
      notify("Failed to save idea", undefined, "error");
    } finally {
      setSaving(false);
    }
  };

  const handleSaveEdit = async () => {
    if (!editingId) return;
    setSaving(true);
    try {
      await updateIdea(editingId, buildIdeaPayload());
      setIsEditing(false);
      setEditingId(null);
      const updatedIdeas = await getIdeas();
      setIdeas(updatedIdeas);
      const updated = updatedIdeas.find((i) => i.tdvsp_ideaid === viewingIdea?.tdvsp_ideaid);
      if (updated) setViewingIdea(updated);
      notify("Idea updated");
    } catch (err) {
      console.error("Failed to save idea:", err);
      notify("Failed to save idea", undefined, "error");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    setSaving(true);
    try {
      await deleteIdea(id);
      loadIdeas();
      notify("Idea deleted");
    } catch (err) {
      console.error("Failed to delete idea:", err);
      notify("Failed to delete idea", undefined, "error");
    } finally {
      setSaving(false);
    }
  };

  const filtered = ideas.filter((idea) => {
    const q = searchQuery.toLowerCase();
    return (
      idea.tdvsp_name?.toLowerCase().includes(q) ||
      idea.tdvsp_description?.toLowerCase().includes(q) ||
      idea.tdvsp_Account?.name?.toLowerCase().includes(q) ||
      (idea.tdvsp_Contact && `${idea.tdvsp_Contact.firstname} ${idea.tdvsp_Contact.lastname}`.toLowerCase().includes(q))
    );
  });

  return (
    <div className={styles.container}>
      <div className={styles.toolbar}>
        <Input
          className={styles.searchBox}
          contentBefore={<Search24Regular />}
          placeholder="Search ideas..."
          value={searchQuery}
          onChange={(_, d) => setSearchQuery(d.value)}
        />
        <Dialog open={dialogOpen} onOpenChange={(_, d) => setDialogOpen(d.open)}>
          <Button appearance="primary" icon={<Add24Regular />} onClick={openNew}>
            New Idea
          </Button>
          <DialogSurface>
            <DialogBody>
              <DialogTitle>New Idea</DialogTitle>
              <DialogContent>
                <div className={styles.formGrid}>
                  <div className={styles.formFieldFull}>
                    <Label required>Name</Label>
                    <Input
                      value={formData.tdvsp_name}
                      onChange={(_, d) =>
                        setFormData({ ...formData, tdvsp_name: d.value })
                      }
                      placeholder="Brief title for this idea"
                    />
                  </div>
                  <div className={styles.formFieldFull}>
                    <Label>Description</Label>
                    <Textarea
                      value={formData.tdvsp_description}
                      onChange={(_, d) =>
                        setFormData({ ...formData, tdvsp_description: d.value })
                      }
                      placeholder="Describe the idea..."
                      rows={4}
                    />
                  </div>
                  <div className={styles.formField}>
                    <Label>Category</Label>
                    <Dropdown
                      placeholder="Select category"
                      value={
                        formData.tdvsp_category
                          ? ideaCategoryLabels[formData.tdvsp_category]
                          : ""
                      }
                      onOptionSelect={(_, d) =>
                        setFormData({
                          ...formData,
                          tdvsp_category: d.optionValue ? (Number(d.optionValue) as IdeaCategory) : "",
                        })
                      }
                    >
                      {categoryOptions.map((cat) => (
                        <Option key={cat.value} value={String(cat.value)}>
                          {cat.label}
                        </Option>
                      ))}
                    </Dropdown>
                  </div>
                  <div className={styles.formField}>
                    <Label>Account</Label>
                    <Dropdown
                      placeholder="Select account"
                      value={
                        accounts.find((a) => a.accountid === formData.accountId)
                          ?.name ?? ""
                      }
                      onOptionSelect={(_, d) =>
                        setFormData({
                          ...formData,
                          accountId: d.optionValue ?? "",
                        })
                      }
                    >
                      {accounts.map((a) => (
                        <Option key={a.accountid} value={a.accountid!}>
                          {a.name}
                        </Option>
                      ))}
                    </Dropdown>
                  </div>
                  <div className={styles.formFieldFull}>
                    <Label>Contact</Label>
                    <Dropdown
                      placeholder="Select contact"
                      value={
                        contacts.find((c) => c.contactid === formData.contactId)
                          ? `${contacts.find((c) => c.contactid === formData.contactId)!.firstname} ${contacts.find((c) => c.contactid === formData.contactId)!.lastname}`
                          : ""
                      }
                      onOptionSelect={(_, d) =>
                        setFormData({
                          ...formData,
                          contactId: d.optionValue ?? "",
                        })
                      }
                    >
                      {contacts.map((c) => (
                        <Option key={c.contactid} value={c.contactid!} text={`${c.firstname} ${c.lastname}`}>
                          {c.firstname} {c.lastname}
                        </Option>
                      ))}
                    </Dropdown>
                  </div>
                </div>
              </DialogContent>
              <DialogActions>
                <Button appearance="secondary" onClick={() => setDialogOpen(false)}>
                  Cancel
                </Button>
                <Button appearance="primary" onClick={handleSaveNew} disabled={saving || !formData.tdvsp_name.trim()}>
                  {saving ? <><Spinner size="tiny" /> Saving...</> : "Save"}
                </Button>
              </DialogActions>
            </DialogBody>
          </DialogSurface>
        </Dialog>
      </div>

      {loading ? (
        <div style={{ display: "flex", justifyContent: "center", padding: 48 }}>
          <Spinner label="Loading ideas..." />
        </div>
      ) : filtered.length === 0 ? (
        <div className={styles.emptyState}>
          <Lightbulb24Filled style={{ fontSize: 48, color: "#fbbf24", marginBottom: 16 }} />
          <Subtitle1>No ideas found</Subtitle1>
          <Caption1 style={{ marginTop: 8 }}>
            Create your first idea to start tracking.
          </Caption1>
        </div>
      ) : (
        <div className={styles.grid}>
          {filtered.map((idea) => (
            <Card key={idea.tdvsp_ideaid} className={styles.ideaCard}>
              <div className={styles.cardHeader}>
                <Subtitle1
                  block
                  className={styles.nameLink}
                  onClick={() => openView(idea)}
                >
                  {idea.tdvsp_name}
                </Subtitle1>
                <div style={{ display: "flex", gap: 4 }}>
                  <Button
                    appearance="subtle"
                    icon={<Edit24Regular />}
                    size="small"
                    title="Edit"
                    onClick={() => openEdit(idea)}
                  />
                  <Button
                    appearance="subtle"
                    icon={<Delete24Regular />}
                    size="small"
                    title="Delete"
                    disabled={saving}
                    onClick={() =>
                      idea.tdvsp_ideaid && handleDelete(idea.tdvsp_ideaid)
                    }
                  />
                </div>
              </div>
              <div className={styles.cardBody}>
                {idea.tdvsp_description && (
                  <Body1 style={{ color: tokens.colorNeutralForeground2 }}>
                    {idea.tdvsp_description}
                  </Body1>
                )}
              </div>
              <Divider style={{ margin: "8px 0", flexShrink: 0 }} />
              <div className={styles.cardMeta}>
                {idea.tdvsp_category && (
                  <span className={styles.categoryBadge}>
                    {ideaCategoryLabels[idea.tdvsp_category]}
                  </span>
                )}
                {idea.tdvsp_Account?.name && (
                  <Caption1>{idea.tdvsp_Account.name}</Caption1>
                )}
                {idea.tdvsp_Contact && (
                  <Caption1>
                    {idea.tdvsp_Contact.firstname} {idea.tdvsp_Contact.lastname}
                  </Caption1>
                )}
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* View Dialog */}
      <Dialog open={viewDialogOpen} onOpenChange={(_, d) => { setViewDialogOpen(d.open); if (!d.open) { setIsEditing(false); setEditingId(null); } }}>
        <DialogSurface style={{ maxWidth: "70vw", width: "70vw" }}>
          <DialogBody>
            <DialogTitle
              action={
                <Button
                  appearance="subtle"
                  icon={<Dismiss24Regular />}
                  onClick={() => setViewDialogOpen(false)}
                />
              }
            >
              Idea Details
            </DialogTitle>
            <DialogContent>
              {viewingIdea && (
                <div className={styles.viewLayout}>
                  <div className={styles.viewDetails}>
                    <div className={styles.viewField}>
                      <Label>Name</Label>
                      {isEditing ? (
                        <Input value={formData.tdvsp_name} onChange={(_, d) => setFormData({ ...formData, tdvsp_name: d.value })} />
                      ) : (
                        <Text block size={400} weight="semibold">
                          {viewingIdea.tdvsp_name}
                        </Text>
                      )}
                    </div>
                    <div className={styles.viewField}>
                      <Label>Description</Label>
                      {isEditing ? (
                        <Textarea value={formData.tdvsp_description} onChange={(_, d) => setFormData({ ...formData, tdvsp_description: d.value })} rows={4} />
                      ) : (
                        <Text block size={400} style={{ whiteSpace: "pre-wrap" }}>
                          {viewingIdea.tdvsp_description || "--"}
                        </Text>
                      )}
                    </div>
                    <div className={styles.viewGrid}>
                      <div className={styles.viewField}>
                        <Label>Category</Label>
                        {isEditing ? (
                          <Dropdown
                            placeholder="Select category"
                            value={formData.tdvsp_category ? ideaCategoryLabels[formData.tdvsp_category] : ""}
                            onOptionSelect={(_, d) => setFormData({ ...formData, tdvsp_category: d.optionValue ? (Number(d.optionValue) as IdeaCategory) : "" })}
                          >
                            {categoryOptions.map((cat) => (
                              <Option key={cat.value} value={String(cat.value)}>{cat.label}</Option>
                            ))}
                          </Dropdown>
                        ) : (
                          <Text block size={400}>
                            {viewingIdea.tdvsp_category
                              ? ideaCategoryLabels[viewingIdea.tdvsp_category]
                              : "--"}
                          </Text>
                        )}
                      </div>
                      <div className={styles.viewField}>
                        <Label>Account</Label>
                        {isEditing ? (
                          <Dropdown
                            placeholder="Select account"
                            value={accounts.find((a) => a.accountid === formData.accountId)?.name ?? ""}
                            onOptionSelect={(_, d) => setFormData({ ...formData, accountId: d.optionValue ?? "" })}
                          >
                            <Option value="" text="(None)">(None)</Option>
                            {accounts.map((a) => (
                              <Option key={a.accountid} value={a.accountid!}>{a.name}</Option>
                            ))}
                          </Dropdown>
                        ) : (
                          <Text block size={400}>
                            {viewingIdea.tdvsp_Account?.name || "--"}
                          </Text>
                        )}
                      </div>
                      <div className={styles.viewField}>
                        <Label>Contact</Label>
                        {isEditing ? (
                          <Dropdown
                            placeholder="Select contact"
                            value={contacts.find((c) => c.contactid === formData.contactId) ? `${contacts.find((c) => c.contactid === formData.contactId)!.firstname} ${contacts.find((c) => c.contactid === formData.contactId)!.lastname}` : ""}
                            onOptionSelect={(_, d) => setFormData({ ...formData, contactId: d.optionValue ?? "" })}
                          >
                            <Option value="" text="(None)">(None)</Option>
                            {contacts.map((c) => (
                              <Option key={c.contactid} value={c.contactid!} text={`${c.firstname} ${c.lastname}`}>{c.firstname} {c.lastname}</Option>
                            ))}
                          </Dropdown>
                        ) : (
                          <Text block size={400}>
                            {viewingIdea.tdvsp_Contact
                              ? `${viewingIdea.tdvsp_Contact.firstname} ${viewingIdea.tdvsp_Contact.lastname}`
                              : "--"}
                          </Text>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className={styles.viewNotes}>
                    <NotesTimeline
                      entityId={viewingIdea.tdvsp_ideaid!}
                      entityName={viewingIdea.tdvsp_name}
                      entityType="idea"
                      odataBindKey="objectid_tdvsp_idea@odata.bind"
                      entitySetPath="/tdvsp_ideas"
                    />
                  </div>
                </div>
              )}
            </DialogContent>
            <DialogActions>
              {isEditing ? (
                <>
                  <Button appearance="secondary" disabled={saving} onClick={() => setIsEditing(false)}>Cancel</Button>
                  <Button appearance="primary" onClick={handleSaveEdit} disabled={saving || !formData.tdvsp_name.trim()}>
                    {saving ? <><Spinner size="tiny" /> Saving...</> : "Save"}
                  </Button>
                </>
              ) : (
                <Button
                  appearance="primary"
                  icon={<Edit24Regular />}
                  onClick={() => viewingIdea && openEdit(viewingIdea)}
                >
                  Edit
                </Button>
              )}
            </DialogActions>
          </DialogBody>
        </DialogSurface>
      </Dialog>
    </div>
  );
};
