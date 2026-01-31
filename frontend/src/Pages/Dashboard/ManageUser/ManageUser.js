import React, { useState, useEffect, useCallback } from "react";
import { Container, Table, Button, Spinner, Alert, Badge } from "react-bootstrap";
import useAuth from "../../../hooks/useAuth";
import API_BASE_URL from "../../../config/api";
import "./ManageUser.css";

const ManageUser = () => {
  const { user: currentUser } = useAuth();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [actionId, setActionId] = useState(null);

  const fetchUsers = useCallback(async () => {
    try {
      setLoading(true);
      setError("");
      const response = await fetch(`${API_BASE_URL}/users`);
      if (!response.ok) throw new Error("Failed to fetch users");
      const data = await response.json();
      setUsers(Array.isArray(data) ? data : []);
    } catch (err) {
      setError(err.message || "Failed to load users");
      setUsers([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  const handleToggleStatus = async (email, currentActive) => {
    setActionId(email);
    try {
      const response = await fetch(`${API_BASE_URL}/users/status`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, active: !currentActive }),
      });
      const data = await response.json();
      if (data.success) {
        setUsers((prev) =>
          prev.map((u) =>
            u.email === email ? { ...u, active: !currentActive } : u
          )
        );
      } else {
        alert(data.error || "Failed to update status");
      }
    } catch (err) {
      alert("Failed to update status");
    } finally {
      setActionId(null);
    }
  };

  const handleDelete = async (email) => {
    if (email === currentUser?.email) {
      alert("You cannot delete your own account.");
      return;
    }
    if (!window.confirm(`Delete user "${email}"? This cannot be undone.`)) return;
    setActionId(email);
    try {
      const response = await fetch(`${API_BASE_URL}/users/${encodeURIComponent(email)}`, {
        method: "DELETE",
      });
      const data = await response.json();
      if (data.success) {
        setUsers((prev) => prev.filter((u) => u.email !== email));
      } else {
        alert(data.error || "Failed to delete user");
      }
    } catch (err) {
      alert("Failed to delete user");
    } finally {
      setActionId(null);
    }
  };

  const formatDate = (date) => {
    if (!date) return "—";
    return new Date(date).toLocaleDateString("en-GB", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  };

  if (loading) {
    return (
      <Container className="manage-user py-4">
        <div className="text-center py-5">
          <Spinner animation="border" />
          <p className="mt-2">Loading users...</p>
        </div>
      </Container>
    );
  }

  return (
    <Container className="manage-user py-4">
      <h2 className="mb-2">Manage Users</h2>
      <p className="text-muted mb-4">
        Activate, deactivate, or delete user accounts. Deactivated users cannot log in.
      </p>
      {error && <Alert variant="danger">{error}</Alert>}
      {!users.length ? (
        <p className="text-muted">No users found.</p>
      ) : (
        <Table striped bordered hover responsive>
          <thead>
            <tr>
              <th>#</th>
              <th>Name</th>
              <th>Email</th>
              <th>Role</th>
              <th>Status</th>
              <th>Joined</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {users.map((user, index) => {
              const isSelf = user.email === currentUser?.email;
              const isActive = user.active !== false;
              return (
                <tr key={user.email}>
                  <td>{index + 1}</td>
                  <td>{user.name || "—"}</td>
                  <td>{user.email}</td>
                  <td>
                    <Badge bg={user.role === "admin" ? "dark" : "secondary"}>
                      {user.role || "user"}
                    </Badge>
                  </td>
                  <td>
                    <Badge bg={isActive ? "success" : "danger"}>
                      {isActive ? "Active" : "Deactivated"}
                    </Badge>
                  </td>
                  <td>{formatDate(user.createdAt)}</td>
                  <td className="manage-user-actions">
                    <Button
                      variant={isActive ? "outline-warning" : "outline-success"}
                      size="sm"
                      className="me-1"
                      onClick={() => handleToggleStatus(user.email, isActive)}
                      disabled={isSelf || actionId === user.email}
                      title={isSelf ? "Cannot change your own status" : isActive ? "Deactivate" : "Activate"}
                    >
                      {actionId === user.email
                        ? "…"
                        : isActive
                        ? "Deactivate"
                        : "Activate"}
                    </Button>
                    <Button
                      variant="danger"
                      size="sm"
                      onClick={() => handleDelete(user.email)}
                      disabled={isSelf || actionId === user.email}
                      title={isSelf ? "Cannot delete your own account" : "Delete user"}
                    >
                      Delete
                    </Button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </Table>
      )}
    </Container>
  );
};

export default ManageUser;
