import React, { useState, useEffect } from "react";
import "./admin.css";

const AdminDashboard = () => {
  const [activeMenu, setActiveMenu] = useState("dashboard");
  const [adminInfo, setAdminInfo] = useState(null);
  const [loading, setLoading] = useState(true);

  // States
  const [dashboardStats, setDashboardStats] = useState({});
  const [clients, setClients] = useState([]);
  const [selectedClient, setSelectedClient] = useState(null);
  const [projects, setProjects] = useState([]);
  const [selectedProject, setSelectedProject] = useState(null);
  const [negotiableProjects, setNegotiableProjects] = useState([]);

  // Form states
  const [negotiationForm, setNegotiationForm] = useState({
    proposedBudget: "",
    proposedDuration: "",
    adminNotes: "",
  });

  const [rejectionForm, setRejectionForm] = useState({
    reason: "",
  });

  const [acceptForm, setAcceptForm] = useState({
    finalBudget: "",
    startDate: "",
    deadline: "",
  });

  const [paymentForm, setPaymentForm] = useState({
    amount: "",
    note: "",
  });

  // Fixed API_URL - remove /api/auth from the base URL
 const API_URL = import.meta.env.VITE_BASE_URL ||'http://localhost:5000';
 


  useEffect(() => {
    fetchAdminProfile();
    if (activeMenu === "dashboard") {
      fetchDashboardStats();
    } else if (activeMenu === "clients") {
      fetchClients();
    } else if (activeMenu === "requests") {
      fetchRequests();
    } else if (activeMenu === "negotiable") {
      fetchNegotiableProjects();
    } else if (activeMenu === "current-work") {
      fetchCurrentWorkProjects();
    }
  }, [activeMenu]);

  const getAuthHeaders = () => ({
    Authorization: `Bearer ${localStorage.getItem("adminToken")}`,
    "Content-Type": "application/json",
  });

  const fetchAdminProfile = async () => {
    try {
      const response = await fetch(`${API_URL}/api/auth/profile`, {
        headers: getAuthHeaders(),
      });
      if (response.ok) {
        const data = await response.json();
        setAdminInfo(data);
      }
    } catch (error) {
      console.error("Error fetching profile:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchDashboardStats = async () => {
    try {
      const response = await fetch(`${API_URL}/api/admin/dashboard/stats`, {
        headers: getAuthHeaders(),
      });
      if (response.ok) {
        const data = await response.json();
        setDashboardStats(data);
      }
    } catch (error) {
      console.error("Error fetching stats:", error);
    }
  };

  const fetchClients = async () => {
    try {
      const response = await fetch(`${API_URL}/api/admin/clients`, {
        headers: getAuthHeaders(),
      });
      if (response.ok) {
        const data = await response.json();
        setClients(data);
      }
    } catch (error) {
      console.error("Error fetching clients:", error);
    }
  };

  const fetchClientDetails = async (clientId) => {
    try {
      const response = await fetch(`${API_URL}/api/admin/clients/${clientId}`, {
        headers: getAuthHeaders(),
      });
      if (response.ok) {
        const data = await response.json();
        setSelectedClient(data);
      }
    } catch (error) {
      console.error("Error fetching client details:", error);
    }
  };

  const fetchRequests = async () => {
    try {
      const response = await fetch(
        `${API_URL}/api/admin/projects/requests?status=requested`,
        {
          headers: getAuthHeaders(),
        }
      );
      if (response.ok) {
        const data = await response.json();
        setProjects(data);
      }
    } catch (error) {
      console.error("Error fetching requests:", error);
    }
  };

  const fetchNegotiableProjects = async () => {
    try {
      const response = await fetch(
        `${API_URL}/api/admin/projects/requests?status=negotiable`,
        {
          headers: getAuthHeaders(),
        }
      );
      if (response.ok) {
        const data = await response.json();
        setNegotiableProjects(data);
      }
    } catch (error) {
      console.error("Error fetching negotiable projects:", error);
    }
  };

  const handleProjectClick = async (projectId) => {
    try {
      const response = await fetch(
        `${API_URL}/api/admin/projects/requests/${projectId}`,
        {
          headers: getAuthHeaders(),
        }
      );
      if (response.ok) {
        const data = await response.json();
        setSelectedProject(data);
        setNegotiationForm({
          proposedBudget: data.budget,
          proposedDuration: data.duration,
          adminNotes: "",
        });
        setAcceptForm({
          finalBudget: data.budget,
          startDate: "",
          deadline: "",
        });
      }
    } catch (error) {
      console.error("Error fetching project details:", error);
    }
  };

  const handleAcceptProject = async () => {
    try {
      const response = await fetch(
        `${API_URL}/api/admin/projects/requests/${selectedProject._id}/accept`,
        {
          method: "PUT",
          headers: getAuthHeaders(),
          body: JSON.stringify(acceptForm),
        }
      );
      if (response.ok) {
        alert("Project accepted successfully!");
        setSelectedProject(null);
        fetchRequests();
        setAcceptForm({ finalBudget: "", startDate: "", deadline: "" });
      } else {
        const error = await response.json();
        alert(error.message || "Failed to accept project");
      }
    } catch (error) {
      console.error("Error accepting project:", error);
      alert("Error accepting project");
    }
  };

  const handleNegotiateProject = async () => {
    try {
      const response = await fetch(
        `${API_URL}/api/admin/projects/requests/${selectedProject._id}/negotiate`,
        {
          method: "PUT",
          headers: getAuthHeaders(),
          body: JSON.stringify(negotiationForm),
        }
      );
      if (response.ok) {
        alert("Negotiation proposal sent successfully!");
        setSelectedProject(null);
        fetchRequests();
        setNegotiationForm({
          proposedBudget: "",
          proposedDuration: "",
          adminNotes: "",
        });
      } else {
        const error = await response.json();
        alert(error.message || "Failed to send negotiation");
      }
    } catch (error) {
      console.error("Error negotiating project:", error);
      alert("Error sending negotiation");
    }
  };

  const handleRejectProject = async () => {
    if (!rejectionForm.reason.trim()) {
      alert("Please provide a rejection reason");
      return;
    }
    try {
      const response = await fetch(
        `${API_URL}/api/admin/projects/requests/${selectedProject._id}/reject`,
        {
          method: "PUT",
          headers: getAuthHeaders(),
          body: JSON.stringify(rejectionForm),
        }
      );
      if (response.ok) {
        alert("Project rejected successfully!");
        setSelectedProject(null);
        fetchRequests();
        setRejectionForm({ reason: "" });
      } else {
        const error = await response.json();
        alert(error.message || "Failed to reject project");
      }
    } catch (error) {
      console.error("Error rejecting project:", error);
      alert("Error rejecting project");
    }
  };

  const handleAddPayment = async (projectId) => {
    if (!paymentForm.amount || paymentForm.amount <= 0) {
      alert("Please enter a valid payment amount");
      return;
    }
    try {
      const response = await fetch(
        `${API_URL}/api/admin/projects/requests/${projectId}/payment`,
        {
          method: "POST",
          headers: getAuthHeaders(),
          body: JSON.stringify(paymentForm),
        }
      );
      if (response.ok) {
        alert("Payment added successfully!");
        setPaymentForm({ amount: "", note: "" });
        if (selectedClient) {
          fetchClientDetails(selectedClient.client._id);
        }
      } else {
        const error = await response.json();
        alert(error.message || "Failed to add payment");
      }
    } catch (error) {
      console.error("Error adding payment:", error);
      alert("Error adding payment");
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("adminToken");
    window.location.href = "/admin/login";
  };
  
  const [currentWorkProjects, setCurrentWorkProjects] = useState([]);
  const [selectedCurrentProject, setSelectedCurrentProject] = useState(null);
  const [commitForm, setCommitForm] = useState({
    weekNumber: "",
    description: "",
    completedTasks: [""],
  });
  const [showCommitModal, setShowCommitModal] = useState(false);

  const fetchCurrentWorkProjects = async () => {
    try {
      const response = await fetch(
        `${API_URL}/api/admin/projects/requests?status=accepted`,
        {
          headers: getAuthHeaders(),
        }
      );
      if (response.ok) {
        const data = await response.json();
        setCurrentWorkProjects(data);
      }
    } catch (error) {
      console.error("Error fetching current work projects:", error);
    }
  };

  const handleCommitSubmit = async (e) => {
    e.preventDefault();

    const cleanedTasks = commitForm.completedTasks.filter(
      (task) => task.trim() !== ""
    );

    if (!commitForm.weekNumber || !commitForm.description) {
      alert("Please fill in week number and description");
      return;
    }

    try {
      const response = await fetch(
        `${API_URL}/api/admin/projects/requests/${selectedCurrentProject._id}/commit`,
        {
          method: "POST",
          headers: getAuthHeaders(),
          body: JSON.stringify({
            weekNumber: parseInt(commitForm.weekNumber),
            description: commitForm.description,
            completedTasks: cleanedTasks,
          }),
        }
      );

      if (response.ok) {
        alert("Progress update added successfully!");
        setCommitForm({
          weekNumber: "",
          description: "",
          completedTasks: [""],
        });
        setShowCommitModal(false);
        fetchCurrentWorkProjectDetails(selectedCurrentProject._id);
      } else {
        const error = await response.json();
        alert(error.message || "Failed to add progress update");
      }
    } catch (error) {
      console.error("Error adding commit:", error);
      alert("Error adding progress update");
    }
  };

  const fetchCurrentWorkProjectDetails = async (projectId) => {
    try {
      const response = await fetch(
        `${API_URL}/api/admin/projects/requests/${projectId}`,
        {
          headers: getAuthHeaders(),
        }
      );
      if (response.ok) {
        const data = await response.json();
        setSelectedCurrentProject(data);
      }
    } catch (error) {
      console.error("Error fetching project details:", error);
    }
  };

  const handleAddTask = () => {
    setCommitForm({
      ...commitForm,
      completedTasks: [...commitForm.completedTasks, ""],
    });
  };

  const handleTaskChange = (index, value) => {
    const newTasks = [...commitForm.completedTasks];
    newTasks[index] = value;
    setCommitForm({
      ...commitForm,
      completedTasks: newTasks,
    });
  };

  const handleRemoveTask = (index) => {
    const newTasks = commitForm.completedTasks.filter((_, i) => i !== index);
    setCommitForm({
      ...commitForm,
      completedTasks: newTasks.length > 0 ? newTasks : [""],
    });
  };

  const renderContent = () => {
    switch (activeMenu) {
      case "dashboard":
        return (
          <div className="admin-a-s-content-section">
            <h2 className="admin-a-s-section-title">Admin Dashboard</h2>
            <p className="admin-a-s-section-description">Overview of all operations</p>

            <div className="admin-a-s-dashboard-grid">
              <div className="admin-a-s-stat-card">
                <div className="admin-a-s-stat-icon">👥</div>
                <div className="admin-a-s-stat-content">
                  <h4>Total Clients</h4>
                  <p className="admin-a-s-stat-value">
                    {dashboardStats.totalClients || 0}
                  </p>
                </div>
              </div>

              <div className="admin-a-s-stat-card">
                <div className="admin-a-s-stat-icon">📊</div>
                <div className="admin-a-s-stat-content">
                  <h4>Total Projects</h4>
                  <p className="admin-a-s-stat-value">
                    {dashboardStats.totalProjects || 0}
                  </p>
                </div>
              </div>

              <div
                className="admin-a-s-stat-card admin-a-s-clickable"
                onClick={() => setActiveMenu("requests")}
              >
                <div className="admin-a-s-stat-icon">🔔</div>
                <div className="admin-a-s-stat-content">
                  <h4>New Requests</h4>
                  <p className="admin-a-s-stat-value admin-a-s-stat-warning">
                    {dashboardStats.requestedProjects || 0}
                  </p>
                </div>
              </div>

              <div className="admin-a-s-stat-card">
                <div className="admin-a-s-stat-icon">✅</div>
                <div className="admin-a-s-stat-content">
                  <h4>Accepted</h4>
                  <p className="admin-a-s-stat-value admin-a-s-stat-success">
                    {dashboardStats.acceptedProjects || 0}
                  </p>
                </div>
              </div>

              <div
                className="admin-a-s-stat-card admin-a-s-clickable"
                onClick={() => setActiveMenu("negotiable")}
              >
                <div className="admin-a-s-stat-icon">🤝</div>
                <div className="admin-a-s-stat-content">
                  <h4>Negotiable</h4>
                  <p className="admin-a-s-stat-value">
                    {dashboardStats.negotiableProjects || 0}
                  </p>
                </div>
              </div>

              <div className="admin-a-s-stat-card">
                <div className="admin-a-s-stat-icon">❌</div>
                <div className="admin-a-s-stat-content">
                  <h4>Rejected</h4>
                  <p className="admin-a-s-stat-value">
                    {dashboardStats.rejectedProjects || 0}
                  </p>
                </div>
              </div>

              <div className="admin-a-s-stat-card">
                <div className="admin-a-s-stat-icon">💰</div>
                <div className="admin-a-s-stat-content">
                  <h4>Total Revenue</h4>
                  <p className="admin-a-s-stat-value">
                    ${dashboardStats.totalRevenue?.toLocaleString() || 0}
                  </p>
                </div>
              </div>

              <div className="admin-a-s-stat-card">
                <div className="admin-a-s-stat-icon">✔️</div>
                <div className="admin-a-s-stat-content">
                  <h4>Total Paid</h4>
                  <p className="admin-a-s-stat-value admin-a-s-stat-success">
                    ${dashboardStats.totalPaid?.toLocaleString() || 0}
                  </p>
                </div>
              </div>

              <div className="admin-a-s-stat-card">
                <div className="admin-a-s-stat-icon">⏳</div>
                <div className="admin-a-s-stat-content">
                  <h4>Total Due</h4>
                  <p className="admin-a-s-stat-value admin-a-s-stat-warning">
                    ${dashboardStats.totalDue?.toLocaleString() || 0}
                  </p>
                </div>
              </div>
            </div>
          </div>
        );

      case "clients":
        return (
          <div className="admin-a-s-content-section">
            <h2 className="admin-a-s-section-title">Clients</h2>
            <p className="admin-a-s-section-description">Manage all registered clients</p>

            {selectedClient ? (
              <div className="admin-a-s-client-details-view">
                <button
                  className="admin-a-s-back-btn"
                  onClick={() => setSelectedClient(null)}
                >
                  ← Back to Clients
                </button>

                <div className="admin-a-s-client-header">
                  <div className="admin-a-s-client-avatar-large">
                    {selectedClient.client.name
                      .split(" ")
                      .map((n) => n[0])
                      .join("")}
                  </div>
                  <div className="admin-a-s-client-info-details">
                    <h3>{selectedClient.client.name}</h3>
                    <p>📧 {selectedClient.client.email}</p>
                    {selectedClient.client.phone && (
                      <p>📞 {selectedClient.client.phone}</p>
                    )}
                    <p>🆔 {selectedClient.client._id}</p>
                    <p>Company: {selectedClient.client.company}</p>
                    <p>Country: {selectedClient.client.country}</p>


                    <p className="admin-a-s-joined-date">
                      Joined:{" "}
                      {new Date(
                        selectedClient.client.createdAt
                      ).toLocaleDateString()}
                    </p>
                  </div>
                </div>

                <div className="admin-a-s-client-stats-grid">
                  <div className="admin-a-s-mini-stat">
                    <span className="admin-a-s-mini-label">Total Projects</span>
                    <span className="admin-a-s-mini-value">
                      {selectedClient.stats.totalProjects}
                    </span>
                  </div>
                  <div className="admin-a-s-mini-stat">
                    <span className="admin-a-s-mini-label">Requested</span>
                    <span className="admin-a-s-mini-value">
                      {selectedClient.stats.requestedProjects}
                    </span>
                  </div>
                  <div className="admin-a-s-mini-stat">
                    <span className="admin-a-s-mini-label">Accepted</span>
                    <span className="admin-a-s-mini-value">
                      {selectedClient.stats.acceptedProjects}
                    </span>
                  </div>
                  <div className="admin-a-s-mini-stat">
                    <span className="admin-a-s-mini-label">Rejected</span>
                    <span className="admin-a-s-mini-value">
                      {selectedClient.stats.rejectedProjects}
                    </span>
                  </div>
                  <div className="admin-a-s-mini-stat">
                    <span className="admin-a-s-mini-label">Total Paid</span>
                    <span className="admin-a-s-mini-value">
                      ${selectedClient.stats.totalPaid.toLocaleString()}
                    </span>
                  </div>
                  <div className="admin-a-s-mini-stat">
                    <span className="admin-a-s-mini-label">Total Due</span>
                    <span className="admin-a-s-mini-value">
                      ${selectedClient.stats.totalDue.toLocaleString()}
                    </span>
                  </div>
                </div>

                <h3 className="admin-a-s-subsection-title">Client Projects</h3>
                <div className="admin-a-s-projects-list">
                  {selectedClient.projects.map((project) => (
                    <div key={project._id} className="admin-a-s-project-item">
                      <div className="admin-a-s-project-item-header">
                        <h4>{project.projectName}</h4>
                        <span
                          className={`admin-a-s-status-badge admin-a-s-status-${project.status}`}
                        >
                          {project.status}
                        </span>
                      </div>
                      <p className="admin-a-s-project-desc">{project.description}</p>
                      <div className="admin-a-s-project-meta">
                        <span>Budget: ${project.budget.toLocaleString()}</span>
                        <span>Duration: {project.duration}</span>
                        <span>Type: {project.projectType}</span>
                      </div>

                      {project.status === "accepted" && project.payment && (
                        <div className="admin-a-s-payment-section">
                          <h5>Payment Details</h5>
                          <div className="admin-a-s-payment-info">
                            <span>
                              Final Budget: $
                              {project.payment.finalBudget?.toLocaleString()}
                            </span>
                            <span>
                              Paid: $
                              {project.payment.paidAmount?.toLocaleString()}
                            </span>
                            <span>
                              Due: $
                              {project.payment.dueAmount?.toLocaleString()}
                            </span>
                          </div>

                          <div className="admin-a-s-payment-form">
                            <input
                              type="number"
                              placeholder="Amount"
                              value={paymentForm.amount}
                              onChange={(e) =>
                                setPaymentForm({
                                  ...paymentForm,
                                  amount: e.target.value,
                                })
                              }
                            />
                            <input
                              type="text"
                              placeholder="Note (optional)"
                              value={paymentForm.note}
                              onChange={(e) =>
                                setPaymentForm({
                                  ...paymentForm,
                                  note: e.target.value,
                                })
                              }
                            />
                            <button
                              className="admin-a-s-add-payment-btn"
                              onClick={() => handleAddPayment(project._id)}
                            >
                              Add Payment
                            </button>
                          </div>

                          {project.payment.paymentHistory?.length > 0 && (
                            <div className="admin-a-s-payment-history">
                              <h6>Payment History</h6>
                              {project.payment.paymentHistory.map(
                                (payment, idx) => (
                                  <div key={idx} className="admin-a-s-payment-record">
                                    <span>
                                      ${payment.amount.toLocaleString()}
                                    </span>
                                    <span>
                                      {new Date(
                                        payment.date
                                      ).toLocaleDateString()}
                                    </span>
                                    {payment.note && (
                                      <span className="admin-a-s-payment-note">
                                        {payment.note}
                                      </span>
                                    )}
                                  </div>
                                )
                              )}
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="admin-a-s-clients-grid">
                {clients.map((client) => (
                  <div
                    key={client._id}
                    className="admin-a-s-client-card"
                    onClick={() => fetchClientDetails(client._id)}
                  >
                    <div className="admin-a-s-client-avatar">
                      {client.name
                        .split(" ")
                        .map((n) => n[0])
                        .join("")}
                    </div>
                    <h3>{client.name}</h3>
                    <p className="admin-a-s-client-email">{client.email}</p>
                    {client.phone && (
                      <p className="admin-a-s-client-contact">📞 {client.phone}</p>
                    )}

                    <div className="admin-a-s-client-mini-stats">
                      <div className="admin-a-s-mini-stat-item">
                        <span className="admin-a-s-label">Projects</span>
                        <span className="admin-a-s-value">
                          {client.stats.totalProjects}
                        </span>
                      </div>
                     

                      <div className="admin-a-s-mini-stat-item">
                        <span className="admin-a-s-label">Paid</span>
                        <span className="admin-a-s-value">
                          ${client.stats.totalPaid.toLocaleString()}
                        </span>
                      </div>
                      <div className="admin-a-s-mini-stat-item">
                        <span className="admin-a-s-label">Due</span>
                        <span className="admin-a-s-value">
                          ${client.stats.totalDue.toLocaleString()}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        );

      case "requests":
        return (
          <div className="admin-a-s-content-section">
            <h2 className="admin-a-s-section-title">Project Requests</h2>
            <p className="admin-a-s-section-description">
              Review and manage new project requests
            </p>

            {selectedProject ? (
              <div className="admin-a-s-project-detail-modal">
                <button
                  className="admin-a-s-back-btn"
                  onClick={() => setSelectedProject(null)}
                >
                  ← Back to Requests
                </button>

                <div className="admin-a-s-project-detail-header">
                  <h3>{selectedProject.projectName}</h3>
                  <span
                    className={`admin-a-s-status-badge admin-a-s-status-${selectedProject.status}`}
                  >
                    {selectedProject.status}
                  </span>
                </div>

                <div className="admin-a-s-client-info-box">
                  <h4>Client Information</h4>
                  <p>
                    <strong>Name:</strong> {selectedProject.userId.name}
                  </p>
                  <p>
                    <strong>Email:</strong> {selectedProject.userId.email}
                  </p>
                  {selectedProject.userId.phone && (
                    <p>
                      <strong>phone:</strong> {selectedProject.userId.phone}
                    </p>
                  )}
                </div>

                <div className="admin-a-s-project-details-grid">
                  <div className="admin-a-s-detail-box">
                    <label>Duration</label>
                    <p>{selectedProject.duration}</p>
                  </div>
                  <div className="admin-a-s-detail-box">
                    <label>Budget</label>
                    <p>${selectedProject.budget.toLocaleString()}</p>
                  </div>
                  <div className="admin-a-s-detail-box">
                    <label>Project Type</label>
                    <p>{selectedProject.projectType}</p>
                  </div>
                  <div className="admin-a-s-detail-box">
                    <label>Submitted</label>
                    <p>
                      {new Date(selectedProject.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                </div>

                <div className="admin-a-s-detail-section">
                  <h4>Description</h4>
                  <p>{selectedProject.description}</p>
                </div>

                <div className="admin-a-s-detail-section">
                  <h4>Tools & Technologies</h4>
                  <div className="admin-a-s-tools-tags">
                    {selectedProject.tools.split(",").map((tool, idx) => (
                      <span key={idx} className="admin-a-s-tool-tag">
                        {tool.trim()}
                      </span>
                    ))}
                  </div>
                </div>

                {selectedProject.attachmentLink && (
                  <div className="admin-a-s-detail-section">
                    <h4>Attachment</h4>
                    <a
                      href={selectedProject.attachmentLink}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      📎 View Attachment
                    </a>
                  </div>
                )}

                <div className="admin-a-s-action-section">
                  <h4>Accept Project</h4>
                  <div className="admin-a-s-action-form">
                    <input
                      type="number"
                      placeholder="Final Budget"
                      value={acceptForm.finalBudget}
                      onChange={(e) =>
                        setAcceptForm({
                          ...acceptForm,
                          finalBudget: e.target.value,
                        })
                      }
                    />
                    <input
                      type="date"
                      placeholder="Start Date"
                      value={acceptForm.startDate}
                      onChange={(e) =>
                        setAcceptForm({
                          ...acceptForm,
                          startDate: e.target.value,
                        })
                      }
                    />
                    <input
                      type="date"
                      placeholder="Deadline"
                      value={acceptForm.deadline}
                      onChange={(e) =>
                        setAcceptForm({
                          ...acceptForm,
                          deadline: e.target.value,
                        })
                      }
                    />
                    <button
                      className="admin-a-s-accept-btn"
                      onClick={handleAcceptProject}
                    >
                      ✅ Accept Project
                    </button>
                  </div>

                  <h4>Negotiate Terms</h4>
                  <div className="admin-a-s-action-form">
                    <input
                      type="number"
                      placeholder="Proposed Budget"
                      value={negotiationForm.proposedBudget}
                      onChange={(e) =>
                        setNegotiationForm({
                          ...negotiationForm,
                          proposedBudget: e.target.value,
                        })
                      }
                    />
                    <input
                      type="text"
                      placeholder="Proposed Duration"
                      value={negotiationForm.proposedDuration}
                      onChange={(e) =>
                        setNegotiationForm({
                          ...negotiationForm,
                          proposedDuration: e.target.value,
                        })
                      }
                    />
                    <textarea
                      placeholder="Notes for client..."
                      value={negotiationForm.adminNotes}
                      onChange={(e) =>
                        setNegotiationForm({
                          ...negotiationForm,
                          adminNotes: e.target.value,
                        })
                      }
                      rows="3"
                    />
                    <button
                      className="admin-a-s-negotiate-btn"
                      onClick={handleNegotiateProject}
                    >
                      🤝 Send Negotiation
                    </button>
                  </div>

                  <h4>Reject Project</h4>
                  <div className="admin-a-s-action-form">
                    <textarea
                      placeholder="Reason for rejection..."
                      value={rejectionForm.reason}
                      onChange={(e) =>
                        setRejectionForm({ reason: e.target.value })
                      }
                      rows="3"
                    />
                    <button
                      className="admin-a-s-reject-btn"
                      onClick={handleRejectProject}
                    >
                      ❌ Reject Project
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              <div className="admin-a-s-requests-list">
                {projects.length > 0 ? (
                  projects.map((project) => (
                    <div
                      key={project._id}
                      className="admin-a-s-request-card"
                      onClick={() => handleProjectClick(project._id)}
                    >
                      <div className="admin-a-s-request-header">
                        <h3>{project.projectName}</h3>
                        <span
                          className={`admin-a-s-status-badge admin-a-s-status-${project.status}`}
                        >
                          {project.status}
                        </span>
                      </div>
                      <p className="admin-a-s-request-client">
                        Client: {project.userId.name} ({project.userId.email})
                      </p>
                      <p className="admin-a-s-request-desc">
                        {project.description.substring(0, 150)}...
                      </p>
                      <div className="admin-a-s-request-meta">
                        <span>💰 ${project.budget.toLocaleString()}</span>
                        <span>⏱️ {project.duration}</span>
                        <span>
                          📅 {new Date(project.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="admin-a-s-empty-state">
                    <p>No pending requests</p>
                  </div>
                )}
              </div>
            )}
          </div>
        );

      case "current-work":
        if (selectedCurrentProject) {
          const projectStatus = selectedCurrentProject.timeline?.deadline
            ? new Date(selectedCurrentProject.timeline.deadline) < new Date()
              ? "Delayed"
              : "In Progress"
            : "In Progress";

          return (
            <div className="admin-a-s-content-section">
              <button
                className="admin-a-s-back-btn"
                onClick={() => setSelectedCurrentProject(null)}
              >
                ← Back to Current Work
              </button>

              <div className="admin-a-s-current-work-detail">
                <div className="admin-a-s-current-work-header">
                  <div className="admin-a-s-current-work-title-section">
                    <h2>{selectedCurrentProject.projectName}</h2>
                    <span className="admin-a-s-status-badge admin-a-s-status-accepted">
                      {projectStatus}
                    </span>
                  </div>
                </div>

                <div className="admin-a-s-client-info-card">
                  <h3>Client Information</h3>
                  <div className="admin-a-s-info-grid">
                    <div className="admin-a-s-info-item">
                      <span className="admin-a-s-info-label">Name:</span>
                      <span className="admin-a-s-info-value">
                        {selectedCurrentProject.userId?.name}
                      </span>
                    </div>
                    <div className="admin-a-s-info-item">
                      <span className="admin-a-s-info-label">Email:</span>
                      <span className="admin-a-s-info-value">
                        {selectedCurrentProject.userId?.email}
                      </span>
                    </div>
                    {selectedCurrentProject.userId?.phone && (
                      <div className="admin-a-s-info-item">
                        <span className="admin-a-s-info-label">phone:</span>
                        <span className="admin-a-s-info-value">
                          {selectedCurrentProject.userId.phone}

                        </span>
                      </div>
                    )}
                  </div>
                </div>

                <div className="admin-a-s-project-detail-card">
                  <h3>Project Details</h3>
                  <p className="admin-a-s-project-description-detail">
                    {selectedCurrentProject.description}
                  </p>

                  <div className="admin-a-s-detail-grid">
                    <div className="admin-a-s-detail-box">
                      <span className="admin-a-s-detail-label">Duration</span>
                      <span className="admin-a-s-detail-value">
                        {selectedCurrentProject.duration}
                      </span>
                    </div>
                    <div className="admin-a-s-detail-box">
                      <span className="admin-a-s-detail-label">Type</span>
                      <span className="admin-a-s-detail-value">
                        {selectedCurrentProject.projectType}
                      </span>
                    </div>
                    {selectedCurrentProject.timeline?.startDate && (
                      <div className="admin-a-s-detail-box">
                        <span className="admin-a-s-detail-label">Start Date</span>
                        <span className="admin-a-s-detail-value">
                          {new Date(
                            selectedCurrentProject.timeline.startDate
                          ).toLocaleDateString()}
                        </span>
                      </div>
                    )}
                    {selectedCurrentProject.timeline?.deadline && (
                      <div className="admin-a-s-detail-box">
                        <span className="admin-a-s-detail-label">Deadline</span>
                        <span className="admin-a-s-detail-value">
                          {new Date(
                            selectedCurrentProject.timeline.deadline
                          ).toLocaleDateString()}
                        </span>
                      </div>
                    )}
                  </div>
                </div>

                {selectedCurrentProject.payment && (
                  <div className="admin-a-s-payment-overview-card">
                    <h3>Payment Overview</h3>
                    <div className="admin-a-s-payment-stats-grid">
                      <div className="admin-a-s-payment-stat">
                        <span className="admin-a-s-stat-icon">💰</span>
                        <div className="admin-a-s-stat-content">
                          <span className="admin-a-s-stat-label">Total Budget</span>
                          <span className="admin-a-s-stat-value">
                            $
                            {selectedCurrentProject.payment.finalBudget?.toLocaleString()}
                          </span>
                        </div>
                      </div>
                      <div className="admin-a-s-payment-stat admin-a-s-payment-stat-success">
                        <span className="admin-a-s-stat-icon">✅</span>
                        <div className="admin-a-s-stat-content">
                          <span className="admin-a-s-stat-label">Paid</span>
                          <span className="admin-a-s-stat-value">
                            $
                            {selectedCurrentProject.payment.paidAmount?.toLocaleString()}
                          </span>
                        </div>
                      </div>
                      <div className="admin-a-s-payment-stat admin-a-s-payment-stat-warning">
                        <span className="admin-a-s-stat-icon">⏳</span>
                        <div className="admin-a-s-stat-content">
                          <span className="admin-a-s-stat-label">Due</span>
                          <span className="admin-a-s-stat-value">
                            $
                            {selectedCurrentProject.payment.dueAmount?.toLocaleString()}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                <div className="admin-a-s-commits-management-section">
                  <div className="admin-a-s-commits-header">
                    <h3>Weekly Progress Updates</h3>
                    <button
                      className="admin-a-s-add-commit-btn"
                      onClick={() => setShowCommitModal(true)}
                    >
                      <span>+ Add Progress Update</span>
                    </button>
                  </div>

                  {selectedCurrentProject.commits &&
                  selectedCurrentProject.commits.length > 0 ? (
                    <div className="admin-a-s-commits-list-admin">
                      {selectedCurrentProject.commits
                        .sort((a, b) => new Date(b.date) - new Date(a.date))
                        .map((commit, idx) => (
                          <div key={idx} className="admin-a-s-admin-commit-card">
                            <div className="admin-a-s-admin-commit-header">
                              <span className="admin-a-s-commit-week-badge">
                                Week {commit.weekNumber}
                              </span>
                              <span className="admin-a-s-commit-date-admin">
                                {new Date(commit.date).toLocaleDateString()}
                              </span>
                            </div>
                            <p className="admin-a-s-commit-description-admin">
                              {commit.description}
                            </p>
                            {commit.completedTasks &&
                              commit.completedTasks.length > 0 && (
                                <div className="admin-a-s-commit-tasks-admin">
                                  <h5>Completed Tasks:</h5>
                                  <ul>
                                    {commit.completedTasks.map(
                                      (task, taskIdx) => (
                                        <li key={taskIdx}>{task}</li>
                                      )
                                    )}
                                  </ul>
                                </div>
                              )}
                          </div>
                        ))}
                    </div>
                  ) : (
                    <div className="admin-a-s-empty-commits-admin">
                      <p>
                        No progress updates yet. Click "Add Progress Update" to
                        create the first entry.
                      </p>
                    </div>
                  )}
                </div>
              </div>

              {showCommitModal && (
                <div
                  className="admin-a-s-modal-overlay"
                  onClick={() => setShowCommitModal(false)}
                >
                  <div
                    className="admin-a-s-modal-content"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <div className="admin-a-s-modal-header">
                      <h3>Add Weekly Progress Update</h3>
                      <button
                        className="admin-a-s-modal-close"
                        onClick={() => setShowCommitModal(false)}
                      >
                        ✕
                      </button>
                    </div>

                    <form onSubmit={handleCommitSubmit} className="admin-a-s-commit-form">
                      <div className="admin-a-s-form-group">
                        <label htmlFor="weekNumber">Week Number *</label>
                        <input
                          type="number"
                          id="weekNumber"
                          value={commitForm.weekNumber}
                          onChange={(e) =>
                            setCommitForm({
                              ...commitForm,
                              weekNumber: e.target.value,
                            })
                          }
                          placeholder="e.g., 1, 2, 3..."
                          required
                          min="1"
                        />
                      </div>

                      <div className="admin-a-s-form-group">
                        <label htmlFor="description">
                          Progress Description *
                        </label>
                        <textarea
                          id="description"
                          value={commitForm.description}
                          onChange={(e) =>
                            setCommitForm({
                              ...commitForm,
                              description: e.target.value,
                            })
                          }
                          placeholder="Describe the work completed this week..."
                          rows="4"
                          required
                        />
                      </div>

                      <div className="admin-a-s-form-group">
                        <label>Completed Tasks (Optional)</label>
                        {commitForm.completedTasks.map((task, index) => (
                          <div key={index} className="admin-a-s-task-input-group">
                            <input
                              type="text"
                              value={task}
                              onChange={(e) =>
                                handleTaskChange(index, e.target.value)
                              }
                              placeholder={`Task ${index + 1}`}
                            />
                            {commitForm.completedTasks.length > 1 && (
                              <button
                                type="button"
                                className="admin-a-s-remove-task-btn"
                                onClick={() => handleRemoveTask(index)}
                              >
                                ✕
                              </button>
                            )}
                          </div>
                        ))}
                        <button
                          type="button"
                          className="admin-a-s-add-task-btn"
                          onClick={handleAddTask}
                        >
                          + Add Another Task
                        </button>
                      </div>

                      <div className="admin-a-s-modal-actions">
                        <button
                          type="button"
                          className="admin-a-s-cancel-btn"
                          onClick={() => setShowCommitModal(false)}
                        >
                          Cancel
                        </button>
                        <button type="submit" className="admin-a-s-submit-btn">
                          Add Progress Update
                        </button>
                      </div>
                    </form>
                  </div>
                </div>
              )}
            </div>
          );
        }

        return (
          <div className="admin-a-s-content-section">
            <h2 className="admin-a-s-section-title">Current Work</h2>
            <p className="admin-a-s-section-description">
              Manage accepted projects and track progress
            </p>

            {currentWorkProjects.length > 0 ? (
              <div className="admin-a-s-current-work-grid">
                {currentWorkProjects.map((project) => (
                  <div
                    key={project._id}
                    className="admin-a-s-current-work-card"
                    onClick={() => fetchCurrentWorkProjectDetails(project._id)}
                  >
                    <div className="admin-a-s-current-work-card-header">
                      <h3>{project.projectName}</h3>
                      <span className="admin-a-s-status-badge admin-a-s-status-accepted">
                        Active
                      </span>
                    </div>

                    <div className="admin-a-s-current-work-client">
                      <span className="admin-a-s-client-label">Client:</span>
                      <span className="admin-a-s-client-name">
                        {project.userId?.name}
                      </span>
                    </div>

                    <p className="admin-a-s-current-work-description">
                      {project.description.substring(0, 120)}...
                    </p>

                    {project.payment && (
                      <div className="admin-a-s-current-work-financials-mini">
                        <div className="admin-a-s-mini-financial">
                          <span className="admin-a-s-mini-label">Budget</span>
                          <span className="admin-a-s-mini-value">
                            ${project.payment.finalBudget?.toLocaleString()}
                          </span>
                        </div>
                        <div className="admin-a-s-mini-financial">
                          <span className="admin-a-s-mini-label">Paid</span>
                          <span className="admin-a-s-mini-value admin-a-s-mini-success">
                            ${project.payment.paidAmount?.toLocaleString()}
                          </span>
                        </div>
                        <div className="admin-a-s-mini-financial">
                          <span className="admin-a-s-mini-label">Due</span>
                          <span className="admin-a-s-mini-value admin-a-s-mini-warning">
                            ${project.payment.dueAmount?.toLocaleString()}
                          </span>
                        </div>
                      </div>
                    )}

                    {project.timeline?.deadline && (
                      <div className="admin-a-s-deadline-info">
                        <span className="admin-a-s-deadline-label">Deadline:</span>
                        <span className="admin-a-s-deadline-date">
                          {new Date(
                            project.timeline.deadline
                          ).toLocaleDateString()}
                        </span>
                      </div>
                    )}

                    <div className="admin-a-s-commits-count">
                      <span>
                        📝 {project.commits?.length || 0} Progress Updates
                      </span>
                    </div>

                    <div className="admin-a-s-card-hover-indicator">
                      <span>Click to manage project →</span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="admin-a-s-empty-state">
                <p>
                  No active projects. Accept project requests to start working.
                </p>
              </div>
            )}
          </div>
        );

      case "negotiable":
        return (
          <div className="admin-a-s-content-section">
            <h2 className="admin-a-s-section-title">Negotiable Projects</h2>
            <p className="admin-a-s-section-description">Projects under negotiation</p>

            <div className="admin-a-s-requests-list">
              {negotiableProjects.length > 0 ? (
                negotiableProjects.map((project) => (
                  <div key={project._id} className="admin-a-s-request-card">
                    <div className="admin-a-s-request-header">
                      <h3>{project.projectName}</h3>
                      <span className="admin-a-s-status-badge admin-a-s-status-negotiable">
                        Negotiable
                      </span>
                    </div>
                    <p className="admin-a-s-request-client">
                      Client: {project.userId.name} ({project.userId.email})
                    </p>

                    {project.negotiation && (
                      <div className="admin-a-s-negotiation-info">
                        <h4>Your Proposal:</h4>
                        <p>
                          Budget: $
                          {project.negotiation.proposedBudget?.toLocaleString()}
                        </p>
                        <p>Duration: {project.negotiation.proposedDuration}</p>
                        <p>Notes: {project.negotiation.adminNotes}</p>
                        <p className="admin-a-s-negotiation-date">
                          Sent:{" "}
                          {new Date(
                            project.negotiation.negotiatedAt
                          ).toLocaleDateString()}
                        </p>
                      </div>
                    )}
                  </div>
                ))
              ) : (
                <div className="admin-a-s-empty-state">
                  <p>No projects under negotiation</p>
                </div>
              )}
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  if (loading) {
    return <div className="admin-a-s-loading-screen">Loading...</div>;
  }

  return (
    <div className="admin-a-s-admin-dashboard-container">
      <div className="admin-a-s-sidebar admin-a-s-admin-sidebar">
        <div className="admin-a-s-admin-info">
          <div className="admin-a-s-admin-avatar">
            {adminInfo?.name
              ?.split(" ")
              .map((n) => n[0])
              .join("") || "A"}
          </div>
          <h3 className="admin-a-s-admin-name">{adminInfo?.name || "Admin"}</h3>
          <p className="admin-a-s-admin-email">
            {adminInfo?.email || "admin@example.com"}
          </p>
          <span className="admin-a-s-admin-badge">Administrator</span>
        </div>

        <nav className="admin-a-s-menu">
          <button
            className={`admin-a-s-menu-item ${
              activeMenu === "dashboard" ? "admin-a-s-active" : ""
            }`}
            onClick={() => setActiveMenu("dashboard")}
          >
            <span className="admin-a-s-menu-icon">📊</span>
            <span>Dashboard</span>
          </button>

          <button
            className={`admin-a-s-menu-item ${activeMenu === "clients" ? "admin-a-s-active" : ""}`}
            onClick={() => setActiveMenu("clients")}
          >
            <span className="admin-a-s-menu-icon">👥</span>
            <span>Clients</span>
          </button>

          <button
            className={`admin-a-s-menu-item ${activeMenu === "requests" ? "admin-a-s-active" : ""}`}
            onClick={() => setActiveMenu("requests")}
          >
            <span className="admin-a-s-menu-icon">📋</span>
            <span>Requests</span>
            {dashboardStats.requestedProjects > 0 && (
              <span className="admin-a-s-notification-badge admin-a-s-green-dot">
                {dashboardStats.requestedProjects}
              </span>
            )}
          </button>

          <button
            className={`admin-a-s-menu-item ${
              activeMenu === "negotiable" ? "admin-a-s-active" : ""
            }`}
            onClick={() => setActiveMenu("negotiable")}
          >
            <span className="admin-a-s-menu-icon">🤝</span>
            <span>Negotiable</span>
            {dashboardStats.negotiableProjects > 0 && (
              <span className="admin-a-s-notification-badge admin-a-s-yellow-dot">
                {dashboardStats.negotiableProjects}
              </span>
            )}
          </button>
          <button
            className={`admin-a-s-menu-item ${
              activeMenu === "current-work" ? "admin-a-s-active" : ""
            }`}
            onClick={() => setActiveMenu("current-work")}
          >
            <span className="admin-a-s-menu-icon">💼</span>
            <span>Current Work</span>
            {dashboardStats.acceptedProjects > 0 && (
              <span className="admin-a-s-notification-badge admin-a-s-blue-dot">
                {dashboardStats.acceptedProjects}
              </span>
            )}
          </button>
        </nav>

        <button className="admin-a-s-logout-btn" onClick={handleLogout}>
          <span className="admin-a-s-menu-icon">🚪</span>
          <span>Logout</span>
        </button>
      </div>

      <div className="admin-a-s-content-area">{renderContent()}</div>
    </div>
  );
};

export default AdminDashboard;