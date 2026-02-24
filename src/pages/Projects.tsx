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
  Briefcase24Filled,
  Edit24Regular,
  Delete24Regular,
  Dismiss24Regular,
} from "@fluentui/react-icons";
import { Project, Account } from "../types";
import {
  getProjects,
  createProject,
  updateProject,
  deactivateProject,
  getAccounts,
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
  projectCard: {
    ...shorthands.padding("16px"),
    ...shorthands.borderRadius("8px"),
    border: `1px solid ${tokens.colorNeutralStroke1}`,
    boxShadow: "none",
    transition: "background-color 0.15s ease",
    ":hover": {
      backgroundColor: tokens.colorNeutralBackground1Hover,
    },
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
  accountId: string;
}

const emptyForm: FormData = {
  tdvsp_name: "",
  tdvsp_description: "",
  accountId: "",
};

export const Projects: React.FC = () => {
  const styles = useStyles();
  const { notify } = useNotification();
  const [searchParams, setSearchParams] = useSearchParams();
  const [projects, setProjects] = useState<Project[]>([]);
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState<FormData>(emptyForm);
  const [viewDialogOpen, setViewDialogOpen] = useState(false);
  const [viewingProject, setViewingProject] = useState<Project | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [saving, setSaving] = useState(false);

  const loadProjects = useCallback(async () => {
    setLoading(true);
    try {
      const data = await getProjects();
      setProjects(data);
    } catch (err) {
      console.error("Failed to load projects:", err);
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

  useEffect(() => {
    loadProjects();
    loadAccounts();
  }, [loadProjects, loadAccounts]);

  // Auto-open new dialog if ?new=true
  useEffect(() => {
    if (searchParams.get("new") === "true") {
      setDialogOpen(true);
      setSearchParams({}, { replace: true });
    }
  }, [searchParams, setSearchParams]);

  const openNew = () => {
    setEditingId(null);
    setFormData(emptyForm);
    setDialogOpen(true);
  };

  const openView = (project: Project) => {
    setIsEditing(false);
    setEditingId(null);
    setViewingProject(project);
    setViewDialogOpen(true);
  };

  const openEdit = (project: Project) => {
    setViewingProject(project);
    setViewDialogOpen(true);
    setEditingId(project.tdvsp_projectid ?? null);
    setFormData({
      tdvsp_name: project.tdvsp_name,
      tdvsp_description: project.tdvsp_description ?? "",
      accountId: project.tdvsp_Account?.accountid ?? "",
    });
    setIsEditing(true);
  };

  const buildProjectPayload = () => {
    const payload: {
      tdvsp_name: string;
      tdvsp_description?: string;
      "tdvsp_Account@odata.bind"?: string;
    } = {
      tdvsp_name: formData.tdvsp_name,
      tdvsp_description: formData.tdvsp_description || undefined,
    };
    if (formData.accountId) {
      payload["tdvsp_Account@odata.bind"] = `/accounts(${formData.accountId})`;
    }
    return payload;
  };

  const handleSaveNew = async () => {
    setSaving(true);
    try {
      await createProject(buildProjectPayload());
      setDialogOpen(false);
      setFormData(emptyForm);
      loadProjects();
      notify("Project created");
    } catch (err) {
      console.error("Failed to save project:", err);
      notify("Failed to save project", undefined, "error");
    } finally {
      setSaving(false);
    }
  };

  const handleSaveEdit = async () => {
    if (!editingId) return;
    setSaving(true);
    try {
      await updateProject(editingId, buildProjectPayload());
      setIsEditing(false);
      setEditingId(null);
      const updatedProjects = await getProjects();
      setProjects(updatedProjects);
      const updated = updatedProjects.find((p) => p.tdvsp_projectid === viewingProject?.tdvsp_projectid);
      if (updated) setViewingProject(updated);
      notify("Project updated");
    } catch (err) {
      console.error("Failed to save project:", err);
      notify("Failed to save project", undefined, "error");
    } finally {
      setSaving(false);
    }
  };

  const handleDeactivate = async (id: string) => {
    setSaving(true);
    try {
      await deactivateProject(id);
      loadProjects();
      notify("Project deactivated");
    } catch (err) {
      console.error("Failed to deactivate project:", err);
      notify("Failed to deactivate project", undefined, "error");
    } finally {
      setSaving(false);
    }
  };

  const filtered = projects.filter((p) => {
    const q = searchQuery.toLowerCase();
    return (
      p.tdvsp_name?.toLowerCase().includes(q) ||
      p.tdvsp_description?.toLowerCase().includes(q) ||
      p.tdvsp_Account?.name?.toLowerCase().includes(q)
    );
  });

  return (
    <div className={styles.container}>
      <div className={styles.toolbar}>
        <Input
          className={styles.searchBox}
          contentBefore={<Search24Regular />}
          placeholder="Search projects..."
          value={searchQuery}
          onChange={(_, d) => setSearchQuery(d.value)}
        />
        <Dialog open={dialogOpen} onOpenChange={(_, d) => setDialogOpen(d.open)}>
          <Button appearance="primary" icon={<Add24Regular />} onClick={openNew}>
            New Project
          </Button>
          <DialogSurface>
            <DialogBody>
              <DialogTitle>New Project</DialogTitle>
              <DialogContent>
                <div className={styles.formGrid}>
                  <div className={styles.formFieldFull}>
                    <Label required>Name</Label>
                    <Input
                      value={formData.tdvsp_name}
                      onChange={(_, d) =>
                        setFormData({ ...formData, tdvsp_name: d.value })
                      }
                      placeholder="Project name"
                    />
                  </div>
                  <div className={styles.formFieldFull}>
                    <Label>Description</Label>
                    <Textarea
                      value={formData.tdvsp_description}
                      onChange={(_, d) =>
                        setFormData({ ...formData, tdvsp_description: d.value })
                      }
                      placeholder="Project description..."
                      rows={3}
                      resize="vertical"
                    />
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
                      <Option value="" text="(None)">
                        (None)
                      </Option>
                      {accounts.map((a) => (
                        <Option key={a.accountid} value={a.accountid!} text={a.name}>
                          {a.name}
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
                <Button
                  appearance="primary"
                  onClick={handleSaveNew}
                  disabled={saving || !formData.tdvsp_name.trim()}
                >
                  {saving ? <><Spinner size="tiny" /> Saving...</> : "Save"}
                </Button>
              </DialogActions>
            </DialogBody>
          </DialogSurface>
        </Dialog>
      </div>

      {loading ? (
        <div style={{ display: "flex", justifyContent: "center", padding: 48 }}>
          <Spinner label="Loading projects..." />
        </div>
      ) : filtered.length === 0 ? (
        <div className={styles.emptyState}>
          <Briefcase24Filled
            style={{ fontSize: 48, color: tokens.colorBrandForeground1, marginBottom: 16 }}
          />
          <Subtitle1>No projects found</Subtitle1>
          <Caption1 style={{ marginTop: 8 }}>
            Create your first project to get started.
          </Caption1>
        </div>
      ) : (
        <div className={styles.grid}>
          {filtered.map((project) => (
            <Card key={project.tdvsp_projectid} className={styles.projectCard}>
              <div className={styles.cardHeader}>
                <div>
                  <Text
                    weight="semibold"
                    size={400}
                    className={styles.nameLink}
                    onClick={() => openView(project)}
                  >
                    {project.tdvsp_name}
                  </Text>
                  {project.tdvsp_description && (
                    <Body1
                      style={{
                        marginTop: 8,
                        color: tokens.colorNeutralForeground2,
                        display: "-webkit-box",
                        WebkitLineClamp: 2,
                        WebkitBoxOrient: "vertical",
                        overflow: "hidden",
                      }}
                    >
                      {project.tdvsp_description}
                    </Body1>
                  )}
                </div>
                <div style={{ display: "flex", gap: 4 }}>
                  <Button
                    appearance="subtle"
                    icon={<Edit24Regular />}
                    size="small"
                    title="Edit"
                    onClick={() => openEdit(project)}
                  />
                  <Button
                    appearance="subtle"
                    icon={<Delete24Regular />}
                    size="small"
                    title="Deactivate"
                    disabled={saving}
                    onClick={() =>
                      project.tdvsp_projectid && handleDeactivate(project.tdvsp_projectid)
                    }
                  />
                </div>
              </div>
              {project.tdvsp_Account?.name && (
                <div className={styles.cardMeta}>
                  <Caption1>{project.tdvsp_Account.name}</Caption1>
                </div>
              )}
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
              Project Details
            </DialogTitle>
            <DialogContent>
              {viewingProject && (
                <div className={styles.viewLayout}>
                  <div className={styles.viewDetails}>
                    <div className={styles.viewField}>
                      <Label>Name</Label>
                      {isEditing ? (
                        <Input
                          value={formData.tdvsp_name}
                          onChange={(_, d) => setFormData({ ...formData, tdvsp_name: d.value })}
                        />
                      ) : (
                        <Text block size={400} weight="semibold">
                          {viewingProject.tdvsp_name}
                        </Text>
                      )}
                    </div>
                    <div className={styles.viewField}>
                      <Label>Description</Label>
                      {isEditing ? (
                        <Textarea
                          value={formData.tdvsp_description}
                          onChange={(_, d) => setFormData({ ...formData, tdvsp_description: d.value })}
                          rows={3}
                          resize="vertical"
                        />
                      ) : (
                        <Text block size={400} style={{ whiteSpace: "pre-wrap" }}>
                          {viewingProject.tdvsp_description || "--"}
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
                            <Option key={a.accountid} value={a.accountid!} text={a.name}>{a.name}</Option>
                          ))}
                        </Dropdown>
                      ) : (
                        <Text block size={400}>
                          {viewingProject.tdvsp_Account?.name || "--"}
                        </Text>
                      )}
                    </div>
                  </div>
                  <div className={styles.viewNotes}>
                    <NotesTimeline
                      entityId={viewingProject.tdvsp_projectid!}
                      entityName={viewingProject.tdvsp_name}
                      entityType="project"
                      odataBindKey="objectid_tdvsp_project@odata.bind"
                      entitySetPath="/tdvsp_projects"
                    />
                  </div>
                </div>
              )}
            </DialogContent>
            <DialogActions>
              {isEditing ? (
                <>
                  <Button appearance="secondary" disabled={saving} onClick={() => { setIsEditing(false); setEditingId(null); }}>Cancel</Button>
                  <Button appearance="primary" onClick={handleSaveEdit} disabled={saving}>
                    {saving ? <><Spinner size="tiny" /> Saving...</> : "Save"}
                  </Button>
                </>
              ) : (
                <Button
                  appearance="primary"
                  icon={<Edit24Regular />}
                  onClick={() => viewingProject && openEdit(viewingProject)}
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
