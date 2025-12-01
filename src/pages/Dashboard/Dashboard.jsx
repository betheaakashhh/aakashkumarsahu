import React, { useState, useEffect } from 'react';
import './dashboard.css';

const Dashboard = () => {
  const [activeMenu, setActiveMenu] = useState('my-projects');
  const [clientInfo, setClientInfo] = useState(null);
  const [loading, setLoading] = useState(true);
  
  // New states for detailed view
  const [selectedWorkProject, setSelectedWorkProject] = useState(null);
  
  // New Project Form State
  const [newProjectForm, setNewProjectForm] = useState({
    projectName: '',
    duration: '',
    budget: '',
    tools: '',
    projectType: '',
    description: '',
    attachmentLink: ''
  });
  
  const [clientForm, setClientForm] = useState({
    name: '',
    email: '',
    phone: '',
    company: '',
    country: '',
    city: '',
    projectExperience: '',
    contactMethod: '',
    budgetPreference: ''
  });

  // Projects State
  const [requestedProjects, setRequestedProjects] = useState([]);
  const [workProjects, setWorkProjects] = useState([]);
  const [notifications, setNotifications] = useState({
    newWorkProjects: 0,
    negotiableProjects: 0,
    rejectedProjects: 0
  });

  const API_URL = import.meta.env.VITE_BASE_URL ||'http://localhost:5000';
 

  // Fetch data on component mount and menu change
  useEffect(() => {
    fetchUserProfile();
    fetchNotifications();
    
    if (activeMenu === 'requested') {
      fetchRequestedProjects();
    } else if (activeMenu === 'work-projects') {
      fetchWorkProjects();
    }
  }, [activeMenu]);

  // Poll for notifications every 30 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      fetchNotifications();
    }, 30000);
    return () => clearInterval(interval);
  }, []);

  const fetchUserProfile = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_URL}/api/auth/profile`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        setClientInfo({
          name: data.name,
          email: data.email,
          userId: data._id,
          phone: data.phone || "",
          company: data.company || "",
          country: data.country || "",
          city: data.city || "",
          projectExperience: data.projectExperience || "",
          contactMethod: data.contactMethod || "email",
          budgetPreference: data.budgetPreference || "",
        });
        setClientForm({
          name: data.name || '',
          email: data.email || '',
          phone: data.phone || '',
          company: data.company || '',
          country: data.country || '',
          city: data.city || '',
          projectExperience: data.projectExperience || '',
          contactMethod: data.contactMethod || 'email',
          budgetPreference: data.budgetPreference || ''
        });
      } else {
        console.error('Failed to fetch profile');
      }
    } catch (error) {
      console.error('Error fetching profile:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchNotifications = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_URL}/api/projects/notifications`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        setNotifications(data);
      }
    } catch (error) {
      console.error('Error fetching notifications:', error);
    }
  };

  const fetchRequestedProjects = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_URL}/api/projects/requests`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        setRequestedProjects(data);
      } else {
        console.error('Failed to fetch projects');
      }
    } catch (error) {
      console.error('Error fetching requested projects:', error);
    }
  };

  const fetchWorkProjects = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_URL}/api/projects/work`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        setWorkProjects(data);
      } else {
        console.error('Failed to fetch work projects');
      }
    } catch (error) {
      console.error('Error fetching work projects:', error);
    }
  };

  const handleNewProjectSubmit = async (e) => {
    e.preventDefault();
    
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_URL}/api/projects/requests`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(newProjectForm)
      });

      if (response.ok) {
        alert('Project request submitted successfully!');
        setNewProjectForm({
          projectName: '',
          duration: '',
          budget: '',
          tools: '',
          projectType: '',
          description: '',
          attachmentLink: ''
        });
        setActiveMenu('requested');
        fetchRequestedProjects();
        fetchNotifications();
      } else {
        const errorData = await response.json();
        alert(errorData.message || 'Failed to submit project request');
      }
    } catch (error) {
      console.error('Error submitting project:', error);
      alert('Error submitting project request: ' + error.message);
    }
  };

  const handleClientInput = (e) => {
    const { name, value } = e.target;
    setClientForm(prev => ({ ...prev, [name]: value }));
  };

  const handleProfileSubmit = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${API_URL}/api/auth/profile/update`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(clientForm)
      });

      if (res.ok) {
        alert("Profile updated!");
        fetchUserProfile();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewProjectForm(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    window.location.href = '/login';
  };

  const getProjectStatus = (project) => {
    if (!project.timeline || !project.timeline.deadline) return 'progress';
    
    const now = new Date();
    const deadline = new Date(project.timeline.deadline);
    const daysRemaining = Math.ceil((deadline - now) / (1000 * 60 * 60 * 24));
    
    if (daysRemaining < 0) return 'delay';
    if (daysRemaining <= 7) return 'urgent';
    return 'progress';
  };

  const getStatusBadgeText = (status) => {
    switch(status) {
      case 'delay': return 'Delayed';
      case 'urgent': return 'Urgent';
      case 'progress': return 'In Progress';
      default: return 'Active';
    }
  };

  // Mock data for portfolio projects
  const myProjects = [
    {
      id: 1,
      title: 'E-Commerce Platform',
      description: 'Full-stack e-commerce solution with React and Node.js',
      status: 'Completed',
      technologies: ['React', 'Node.js', 'MongoDB'],
      githubLink: 'https://github.com/aakash/ecommerce'
    },
    {
      id: 2,
      title: 'Task Management App',
      description: 'Real-time task tracking application',
      status: 'Completed',
      technologies: ['React', 'Firebase', 'Tailwind'],
      githubLink: 'https://github.com/aakash/taskapp'
    },
    {
      id: 3,
      title: 'Weather Dashboard',
      description: 'Weather forecast application with API integration',
      status: 'Completed',
      technologies: ['React', 'API Integration', 'CSS3'],
      githubLink: 'https://github.com/aakash/weather'
    }
  ];

  const renderContent = () => {
    switch (activeMenu) {
      case 'my-projects':
        return (
          <div className="content-section">
            <h2 className="section-title">My Portfolio Projects</h2>
            <p className="section-description">Personal projects showcasing my development skills</p>
            <div className="projects-grid">
              {myProjects.map((project) => (
                <div key={project.id} className="project-card">
                  <div className="project-header">
                    <h3>{project.title}</h3>
                    <span className="status-badge status-completed">
                      {project.status}
                    </span>
                  </div>
                  <p className="project-description">{project.description}</p>
                  <div className="tech-stack">
                    {project.technologies.map((tech, idx) => (
                      <span key={idx} className="tech-tag">{tech}</span>
                    ))}
                  </div>
                  <a href={project.githubLink} target="_blank" rel="noopener noreferrer" className="project-link">
                    View on GitHub →
                  </a>
                </div>
              ))}
            </div>
          </div>
        );

      case 'profile':
        return (
          <div className="content-section">
            <h2 className="section-title">Client Profile</h2>

            <form className="new-project-form" onSubmit={handleProfileSubmit}>
              
              <div className="form-grid">
                <div className="form-group">
                  <label>Name</label>
                  <input type="text" name="name"
                    value={clientForm.name}
                    onChange={handleClientInput} required />
                </div>

                <div className="form-group">
                  <label>Phone</label>
                  <input type="text" name="phone"
                    value={clientForm.phone}
                    onChange={handleClientInput} />
                </div>

                <div className="form-group">
                  <label>Company</label>
                  <input type="text" name="company"
                    value={clientForm.company}
                    onChange={handleClientInput} />
                </div>

                <div className="form-group">
                  <label>Country</label>
                  <input type="text" name="country"
                    value={clientForm.country}
                    onChange={handleClientInput} />
                </div>

                <div className="form-group">
                  <label>City</label>
                  <input type="text" name="city"
                    value={clientForm.city}
                    onChange={handleClientInput} />
                </div>
              </div>

              <div className="form-group full-width">
                <label>Project Experience</label>
                <textarea
                  name="projectExperience"
                  rows="4"
                  value={clientForm.projectExperience}
                  onChange={handleClientInput}
                ></textarea>
              </div>

              <div className="form-group full-width">
                <label>Preferred Contact</label>
                <select
                  name="contactMethod"
                  value={clientForm.contactMethod}
                  onChange={handleClientInput}
                >
                  <option value="email">Email</option>
                  <option value="phone">Phone Call</option>
                  <option value="whatsapp">WhatsApp</option>
                </select>
              </div>

              <div className="form-group full-width">
                <label>Budget Preference</label>
                <input type="text" name="budgetPreference"
                  placeholder="e.g. $1k - $5k"
                  value={clientForm.budgetPreference}
                  onChange={handleClientInput} />
              </div>

              <button type="submit" className="submit-btn">Save Profile</button>
            </form>
          </div>
        );

      case 'work-projects':
        if (selectedWorkProject) {
          const projectStatus = getProjectStatus(selectedWorkProject);
          const requestedDate = new Date(selectedWorkProject.createdAt);
          const acceptedDate = selectedWorkProject.timeline?.startDate 
            ? new Date(selectedWorkProject.timeline.startDate) 
            : null;

          return (
            <div className="content-section">
              <button 
                className="back-btn" 
                onClick={() => setSelectedWorkProject(null)}
              >
                ← Back to Work Projects
              </button>

              <div className="work-detail-container">
                <div className="work-detail-header">
                  <div className="work-detail-title-section">
                    <h2>{selectedWorkProject.projectName}</h2>
                    <div className="work-detail-badges">
                      <span className="status-badge status-accepted">Accepted</span>
                      <span className={`status-badge status-${projectStatus}`}>
                        {getStatusBadgeText(projectStatus)}
                      </span>
                    </div>
                  </div>
                  
                  <div className="work-detail-dates">
                    <div className="date-item">
                      <span className="date-label">Requested:</span>
                      <span className="date-value">{requestedDate.toLocaleDateString()}</span>
                    </div>
                    {acceptedDate && (
                      <div className="date-item">
                        <span className="date-label">Accepted:</span>
                        <span className="date-value">{acceptedDate.toLocaleDateString()}</span>
                      </div>
                    )}
                  </div>
                </div>

                <div className="work-detail-description">
                  <h3>Project Description</h3>
                  <p>{selectedWorkProject.description}</p>
                </div>

                <div className="work-detail-financials">
                  <div className="financial-card">
                    <div className="financial-icon">💰</div>
                    <div className="financial-content">
                      <span className="financial-label">Total Budget</span>
                      <span className="financial-amount">
                        ${selectedWorkProject.payment?.finalBudget?.toLocaleString() || 0}
                      </span>
                    </div>
                  </div>

                  <div className="financial-card financial-success">
                    <div className="financial-icon">✅</div>
                    <div className="financial-content">
                      <span className="financial-label">Paid</span>
                      <span className="financial-amount">
                        ${selectedWorkProject.payment?.paidAmount?.toLocaleString() || 0}
                      </span>
                    </div>
                  </div>

                  <div className="financial-card financial-warning">
                    <div className="financial-icon">⏳</div>
                    <div className="financial-content">
                      <span className="financial-label">Due</span>
                      <span className="financial-amount">
                        ${selectedWorkProject.payment?.dueAmount?.toLocaleString() || 0}
                      </span>
                    </div>
                  </div>
                </div>

                {selectedWorkProject.payment && (
                  <div className="payment-progress-section">
                    <div className="progress-bar-large">
                      <div 
                        className="progress-fill-large"
                        style={{ 
                          width: `${(selectedWorkProject.payment.paidAmount / selectedWorkProject.payment.finalBudget) * 100}%` 
                        }}
                      ></div>
                    </div>
                    <p className="progress-text-large">
                      {Math.round((selectedWorkProject.payment.paidAmount / selectedWorkProject.payment.finalBudget) * 100)}% Completed
                    </p>
                  </div>
                )}

                {/* Admin Commits Section */}
                <div className="commits-section">
                  <h3>Weekly Progress Updates</h3>
                  {selectedWorkProject.commits && selectedWorkProject.commits.length > 0 ? (
                    <div className="commits-timeline">
                      {selectedWorkProject.commits
                        .sort((a, b) => new Date(b.date) - new Date(a.date))
                        .map((commit, idx) => (
                          <div key={idx} className="commit-item">
                            <div className="commit-indicator">
                              <div className="commit-dot"></div>
                              {idx !== selectedWorkProject.commits.length - 1 && (
                                <div className="commit-line"></div>
                              )}
                            </div>
                            <div className="commit-content">
                              <div className="commit-header">
                                <span className="commit-week">Week {commit.weekNumber}</span>
                                <span className="commit-date">
                                  {new Date(commit.date).toLocaleDateString()}
                                </span>
                              </div>
                              <div className="commit-body">
                                <p>{commit.description}</p>
                                {commit.completedTasks && commit.completedTasks.length > 0 && (
                                  <div className="commit-tasks">
                                    <h5>Completed Tasks:</h5>
                                    <ul>
                                      {commit.completedTasks.map((task, taskIdx) => (
                                        <li key={taskIdx}>{task}</li>
                                      ))}
                                    </ul>
                                  </div>
                                )}
                              </div>
                            </div>
                          </div>
                        ))}
                    </div>
                  ) : (
                    <div className="empty-commits">
                      <p>No progress updates yet. Admin will post weekly updates here.</p>
                    </div>
                  )}
                </div>

                {selectedWorkProject.payment?.paymentHistory && 
                 selectedWorkProject.payment.paymentHistory.length > 0 && (
                  <div className="payment-history-detail">
                    <h3>Payment History</h3>
                    <div className="payment-history-table">
                      {selectedWorkProject.payment.paymentHistory
                        .sort((a, b) => new Date(b.date) - new Date(a.date))
                        .map((payment, idx) => (
                          <div key={idx} className="payment-row">
                            <div className="payment-col">
                              <span className="payment-label">Amount</span>
                              <span className="payment-value-large">
                                ${payment.amount.toLocaleString()}
                              </span>
                            </div>
                            <div className="payment-col">
                              <span className="payment-label">Date</span>
                              <span className="payment-value">
                                {new Date(payment.date).toLocaleDateString()}
                              </span>
                            </div>
                            {payment.note && (
                              <div className="payment-col payment-note-col">
                                <span className="payment-label">Note</span>
                                <span className="payment-value">{payment.note}</span>
                              </div>
                            )}
                          </div>
                        ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          );
        }

        return (
          <div className="content-section">
            <h2 className="section-title">Work Projects</h2>
            <p className="section-description">Your accepted projects and their progress</p>
            {workProjects.length > 0 ? (
              <div className="work-projects-list">
                {workProjects.map((project) => (
                  <div 
                    key={project._id} 
                    className="work-project-card clickable-card"
                    onClick={() => setSelectedWorkProject(project)}
                  >
                    <div className="work-project-header">
                      <div>
                        <h3>{project.projectName}</h3>
                        {project.timeline && (
                          <p className="project-dates">
                            {project.timeline.startDate && `Started: ${new Date(project.timeline.startDate).toLocaleDateString()}`}
                            {project.timeline.deadline && ` | Deadline: ${new Date(project.timeline.deadline).toLocaleDateString()}`}
                          </p>
                        )}
                      </div>
                      <span className="status-badge status-accepted">
                        {project.status}
                      </span>
                    </div>
                    <p className="project-description">{project.description}</p>
                    
                    {project.payment && (
                      <>
                        <div className="project-financials">
                          <div className="financial-item">
                            <span className="financial-label">Total Budget</span>
                            <span className="financial-value">${project.payment.finalBudget?.toLocaleString()}</span>
                          </div>
                          <div className="financial-item">
                            <span className="financial-label">Paid</span>
                            <span className="financial-value financial-success">${project.payment.paidAmount?.toLocaleString()}</span>
                          </div>
                          <div className="financial-item">
                            <span className="financial-label">Remaining</span>
                            <span className="financial-value financial-warning">${project.payment.dueAmount?.toLocaleString()}</span>
                          </div>
                        </div>
                        <div className="progress-bar">
                          <div 
                            className="progress-fill"
                            style={{ width: `${(project.payment.paidAmount / project.payment.finalBudget) * 100}%` }}
                          ></div>
                        </div>
                        <p className="progress-text">
                          {Math.round((project.payment.paidAmount / project.payment.finalBudget) * 100)}% paid
                        </p>
                      </>
                    )}
                    
                    <div className="card-hover-indicator">
                      <span>Click to view details →</span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="empty-state">
                <p>No accepted projects yet</p>
                <button 
                  className="cta-btn"
                  onClick={() => setActiveMenu('new-project')}
                >
                  + Request Your First Project
                </button>
              </div>
            )}
          </div>
        );

      case 'new-project':
        return (
          <div className="content-section">
            <h2 className="section-title">Request New Project</h2>
            <p className="section-description">Submit a project request and I'll get back to you</p>
            
            <form onSubmit={handleNewProjectSubmit} className="new-project-form">
              <div className="form-grid">
                <div className="form-group">
                  <label htmlFor="projectName">Project Name *</label>
                  <input
                    type="text"
                    id="projectName"
                    name="projectName"
                    value={newProjectForm.projectName}
                    onChange={handleInputChange}
                    placeholder="E.g., E-commerce Website"
                    required
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="duration">Duration *</label>
                  <input
                    type="text"
                    id="duration"
                    name="duration"
                    value={newProjectForm.duration}
                    onChange={handleInputChange}
                    placeholder="E.g., 2-3 months"
                    required
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="budget">Budget (USD) *</label>
                  <input
                    type="number"
                    id="budget"
                    name="budget"
                    value={newProjectForm.budget}
                    onChange={handleInputChange}
                    placeholder="E.g., 5000"
                    required
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="projectType">Project Type *</label>
                  <select
                    id="projectType"
                    name="projectType"
                    value={newProjectForm.projectType}
                    onChange={handleInputChange}
                    required
                  >
                    <option value="">Select type</option>
                    <option value="web-application">Web Application</option>
                    <option value="mobile-app">Mobile App</option>
                    <option value="api-development">API Development</option>
                    <option value="ui-ux-design">UI/UX Design</option>
                    <option value="full-stack">Full-Stack Development</option>
                    <option value="frontend">Frontend Only</option>
                    <option value="backend">Backend Only</option>
                    <option value="other">Other</option>
                  </select>
                </div>
              </div>

              <div className="form-group full-width">
                <label htmlFor="tools">Tools & Technologies *</label>
                <input
                  type="text"
                  id="tools"
                  name="tools"
                  value={newProjectForm.tools}
                  onChange={handleInputChange}
                  placeholder="E.g., React, Node.js, MongoDB, JavaScript"
                  required
                />
                <span className="form-hint">Separate multiple tools with commas</span>
              </div>

              <div className="form-group full-width">
                <label htmlFor="description">Project Description *</label>
                <textarea
                  id="description"
                  name="description"
                  value={newProjectForm.description}
                  onChange={handleInputChange}
                  placeholder="Describe your project requirements, features, and any specific needs..."
                  rows="6"
                  required
                ></textarea>
              </div>

              <div className="form-group full-width">
                <label htmlFor="attachmentLink">Attachment Link (Optional)</label>
                <input
                  type="url"
                  id="attachmentLink"
                  name="attachmentLink"
                  value={newProjectForm.attachmentLink}
                  onChange={handleInputChange}
                  placeholder="https://drive.google.com/... or any reference link"
                />
                <span className="form-hint">Link to documents, designs, or requirements</span>
              </div>

              <button type="submit" className="submit-btn">
                Submit Project Request
              </button>
            </form>
          </div>
        );

      case 'requested':
        return (
          <div className="content-section">
            <h2 className="section-title">Requested Projects</h2>
            <p className="section-description">Track your project requests and their status</p>
            
            {requestedProjects.length > 0 ? (
              <div className="requested-projects-list">
                {requestedProjects.map((project) => (
                  <div key={project._id} className="requested-project-card">
                    <div className="requested-header">
                      <div>
                        <h3>{project.projectName}</h3>
                        <p className="requested-date">
                          Submitted: {new Date(project.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                      <span className={`status-badge status-${project.status.toLowerCase()}`}>
                        {project.status}
                      </span>
                    </div>

                    <div className="requested-details">
                      <div className="detail-item">
                        <span className="detail-label">Duration:</span>
                        <span className="detail-value">{project.duration}</span>
                      </div>
                      <div className="detail-item">
                        <span className="detail-label">Budget:</span>
                        <span className="detail-value">${project.budget?.toLocaleString()}</span>
                      </div>
                      <div className="detail-item">
                        <span className="detail-label">Type:</span>
                        <span className="detail-value">{project.projectType}</span>
                      </div>
                    </div>
                    <p className="requested-description">{project.description}</p>

                    <div className="tools-list">
                      {project.tools.split(',').map((tool, idx) => (
                        <span key={idx} className="tool-tag">{tool.trim()}</span>
                      ))}
                    </div>

                    {project.attachmentLink && (
                      <a href={project.attachmentLink} target="_blank" rel="noopener noreferrer" className="attachment-link">
                        📎 View Attachment
                      </a>
                    )}

                    {project.status === 'negotiable' && project.negotiation && (
                      <div className="negotiation-box">
                        <h4>💬 Admin's Negotiation Proposal</h4>
                        <div className="negotiation-details">
                          <div className="negotiation-item">
                            <span className="label">Proposed Budget:</span>
                            <span className="value">${project.negotiation.proposedBudget?.toLocaleString()}</span>
                          </div>
                          <div className="negotiation-item">
                            <span className="label">Proposed Duration:</span>
                            <span className="value">{project.negotiation.proposedDuration}</span>
                          </div>
                          {project.negotiation.adminNotes && (
                            <div className="negotiation-notes">
                              <span className="label">Notes:</span>
                              <p>{project.negotiation.adminNotes}</p>
                            </div>
                          )}
                        </div>
                      </div>
                    )}

                    {project.status === 'rejected' && project.rejection && (
                      <div className="rejection-box">
                        <h4>❌ Rejection Reason</h4>
                        <p>{project.rejection.reason}</p>
                        <span className="rejection-date">
                          Rejected on: {new Date(project.rejection.rejectedAt).toLocaleDateString()}
                        </span>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <div className="empty-state">
                <p>No project requests yet</p>
                <button 
                  className="cta-btn"
                  onClick={() => setActiveMenu('new-project')}
                >
                  + Request Your First Project
                </button>
              </div>
            )}
          </div>
        );

      case 'dashboard':
        const totalProjects = requestedProjects.length + workProjects.length;
        const acceptedProjects = workProjects.length;
        const pendingProjects = requestedProjects.filter(p => p.status === 'requested').length;
        const totalPaid = workProjects.reduce((sum, p) => sum + (p.payment?.paidAmount || 0), 0);
        const totalDue = workProjects.reduce((sum, p) => sum + (p.payment?.dueAmount || 0), 0);

        return (
          <div className="content-section">
            <h2 className="section-title">Dashboard</h2>
            <p className="section-description">Overview of your projects and collaboration</p>
            <div className="dashboard-grid">
              <div className="stat-card">
                <div className="stat-icon">📊</div>
                <div className="stat-content">
                  <h4>Total Projects</h4>
                  <p className="stat-value">{totalProjects}</p>
                </div>
              </div>
              <div className="stat-card">
                <div className="stat-icon">✅</div>
                <div className="stat-content">
                  <h4>Accepted</h4>
                  <p className="stat-value stat-success">{acceptedProjects}</p>
                </div>
              </div>
              <div className="stat-card">
                <div className="stat-icon">⏳</div>
                <div className="stat-content">
                  <h4>Pending</h4>
                  <p className="stat-value stat-warning">{pendingProjects}</p>
                </div>
              </div>
              <div className="stat-card">
                <div className="stat-icon">💰</div>
                <div className="stat-content">
                  <h4>Total Paid</h4>
                  <p className="stat-value">${totalPaid.toLocaleString()}</p>
                </div>
              </div>
              <div className="stat-card">
                <div className="stat-icon">💳</div>
                <div className="stat-content">
                  <h4>Total Due</h4>
                  <p className="stat-value stat-warning">${totalDue.toLocaleString()}</p>
                </div>
              </div>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  if (loading) {
    return <div className="loading-screen">Loading...</div>;
  }

  return (
    <div className="dashboard-container">
      <div className="sidebar">
        <div className="client-info">
          <div className="client-avatar">
            {clientInfo?.name?.split(' ').map(n => n[0]).join('') || 'U'}
          </div>
          <h3 className="client-name">{clientInfo?.name || 'User'}</h3>
          <p className="client-email">{clientInfo?.email || 'user@example.com'}</p>
          <p className="client-id">ID: {clientInfo?.userId?.slice(-8) || 'N/A'}</p>
        </div>

        <nav className="menu">
          <button
            className={`menu-item ${activeMenu === 'dashboard' ? 'active' : ''}`}
            onClick={() => setActiveMenu('dashboard')}
          >
            <span className="menu-icon">📊</span>
            <span>Dashboard</span>
          </button>
          
          <button
            className={`menu-item ${activeMenu === 'my-projects' ? 'active' : ''}`}
            onClick={() => setActiveMenu('my-projects')}
          >
            <span className="menu-icon">📂</span>
            <span>My Projects</span>
          </button>
          
          <button
            className={`menu-item ${activeMenu === 'profile' ? 'active' : ''}`}
            onClick={() => setActiveMenu('profile')}
          >
            <span className="menu-icon">👤</span>
            <span>Client Profile</span>
          </button>
          
          <button
            className={`menu-item ${activeMenu === 'work-projects' ? 'active' : ''}`}
            onClick={() => setActiveMenu('work-projects')}
          >
            <span className="menu-icon">💼</span>
            <span>Work Projects</span>
            {notifications.newWorkProjects > 0 && (
              <span className="notification-dot green-dot"></span>
            )}
          </button>
          
          <button
            className={`menu-item ${activeMenu === 'new-project' ? 'active' : ''}`}
            onClick={() => setActiveMenu('new-project')}
          >
            <span className="menu-icon">➕</span>
            <span>New Project</span>
          </button>
          
          <button
            className={`menu-item ${activeMenu === 'requested' ? 'active' : ''}`}
            onClick={() => setActiveMenu('requested')}
          >
            <span className="menu-icon">📋</span>
            <span>Requested</span>
            {(notifications.negotiableProjects > 0 || notifications.rejectedProjects > 0) && (
              <span className={`notification-dot ${notifications.negotiableProjects > 0 ? 'yellow-dot' : 'red-dot'}`}></span>
            )}
          </button>
        </nav>

        <button className="logout-btn" onClick={handleLogout}>
          <span className="menu-icon">🚪</span>
          <span>Logout</span>
        </button>
      </div>

      <div className="content-area">
        {renderContent()}
      </div>
    </div>
  );
};

export default Dashboard;