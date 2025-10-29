import { useState, useEffect } from "react";
import {
  Card,
  CardHeader,
  CardBody,
  Typography,
  Avatar,
  Chip,
  Button,
  Dialog,
  DialogHeader,
  DialogBody,
  DialogFooter,
  Input,
} from "@material-tailwind/react";
import { PencilIcon, TrashIcon, UserCircleIcon } from "@heroicons/react/24/outline";
import api from "@/services/api";
import { useAuth } from "@/context/AuthContext";

export function Users() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editDialog, setEditDialog] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [formData, setFormData] = useState({});
  const { user: currentUser } = useAuth();

  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async () => {
    try {
      setLoading(true);
      // Load all users from the new /users endpoint
      const response = await api.fetch('/users');
      
      setUsers(response.users || []);
    } catch (error) {
      console.error("Error loading users:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (user) => {
    setSelectedUser(user);
    setFormData({
      nom: user.nom || "",
      age: user.age || "",
      nationalite: user.nationalite || "",
      email: user.email || "",
    });
    setEditDialog(true);
  };

  const handleSave = async () => {
    try {
      const uri = selectedUser.uri;
      const endpoint = selectedUser.type === 'Guide' ? 'guide' : 'touriste';
      
      await api.fetch(`/${endpoint}/${encodeURIComponent(uri)}`, {
        method: 'PUT',
        body: JSON.stringify(formData),
      });
      
      setEditDialog(false);
      loadUsers();
    } catch (error) {
      console.error("Error updating user:", error);
      alert("Failed to update user");
    }
  };

  const handleDelete = async (user) => {
    if (!window.confirm("Are you sure you want to delete this user?")) return;

    try {
      const uri = user.uri;
      const endpoint = user.type === 'Guide' ? 'guide' : 'touriste';
      
      await api.fetch(`/${endpoint}/${encodeURIComponent(uri)}`, {
        method: 'DELETE',
      });
      
      loadUsers();
    } catch (error) {
      console.error("Error deleting user:", error);
      alert("Failed to delete user");
    }
  };

  const getUserType = (user) => {
    const type = user.type || "";
    if (type === "Touriste") return "Tourist";
    if (type === "Guide") return "Guide";
    return "User";
  };

  if (loading) {
    return (
      <div className="mt-12 flex justify-center">
        <Typography>Loading users...</Typography>
      </div>
    );
  }

  return (
    <>
      <div className="mt-12 mb-8 flex flex-col gap-12">
        <Card>
          <CardHeader variant="gradient" color="gray" className="mb-8 p-6">
            <div className="flex items-center justify-between">
              <Typography variant="h6" color="white">
                Users Management
              </Typography>
              <Typography variant="small" color="white" className="opacity-80">
                Total: {users.length} users
              </Typography>
            </div>
          </CardHeader>
          <CardBody className="overflow-x-scroll px-0 pt-0 pb-2">
            <table className="w-full min-w-[640px] table-auto">
              <thead>
                <tr>
                  {["User", "Email", "Type", "Age", "Nationality", "Actions"].map((el) => (
                    <th
                      key={el}
                      className="border-b border-blue-gray-50 py-3 px-5 text-left"
                    >
                      <Typography
                        variant="small"
                        className="text-[11px] font-bold uppercase text-blue-gray-400"
                      >
                        {el}
                      </Typography>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {users.map((user, key) => {
                  const className = `py-3 px-5 ${
                    key === users.length - 1
                      ? ""
                      : "border-b border-blue-gray-50"
                  }`;

                  const nom = user.nom || "Unknown";
                  const email = user.email || "N/A";
                  const age = user.age || "N/A";
                  const nationalite = user.nationalite || "N/A";
                  const userType = getUserType(user);

                  return (
                    <tr key={key}>
                      <td className={className}>
                        <div className="flex items-center gap-4">
                          <Avatar 
                            src="/img/team-2.jpg" 
                            alt={nom} 
                            size="sm" 
                            variant="rounded"
                            icon={<UserCircleIcon />}
                          />
                          <div>
                            <Typography
                              variant="small"
                              color="blue-gray"
                              className="font-semibold"
                            >
                              {nom}
                            </Typography>
                          </div>
                        </div>
                      </td>
                      <td className={className}>
                        <Typography className="text-xs font-normal text-blue-gray-500">
                          {email}
                        </Typography>
                      </td>
                      <td className={className}>
                        <Chip
                          variant="gradient"
                          color={userType === "Guide" ? "green" : "blue"}
                          value={userType}
                          className="py-0.5 px-2 text-[11px] font-medium w-fit"
                        />
                      </td>
                      <td className={className}>
                        <Typography className="text-xs font-semibold text-blue-gray-600">
                          {age}
                        </Typography>
                      </td>
                      <td className={className}>
                        <Typography className="text-xs font-semibold text-blue-gray-600">
                          {nationalite}
                        </Typography>
                      </td>
                      <td className={className}>
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            variant="text"
                            color="blue"
                            onClick={() => handleEdit(user)}
                          >
                            <PencilIcon className="h-4 w-4" />
                          </Button>
                          <Button
                            size="sm"
                            variant="text"
                            color="red"
                            onClick={() => handleDelete(user)}
                            disabled={user.email === currentUser?.email}
                          >
                            <TrashIcon className="h-4 w-4" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </CardBody>
        </Card>
      </div>

      {/* Edit Dialog */}
      <Dialog open={editDialog} handler={() => setEditDialog(!editDialog)}>
        <DialogHeader>Edit User</DialogHeader>
        <DialogBody divider className="flex flex-col gap-4">
          <Input
            label="Name"
            value={formData.nom || ""}
            onChange={(e) => setFormData({ ...formData, nom: e.target.value })}
          />
          <Input
            label="Email"
            value={formData.email || ""}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
          />
          <Input
            label="Age"
            type="number"
            value={formData.age || ""}
            onChange={(e) => setFormData({ ...formData, age: e.target.value })}
          />
          <Input
            label="Nationality"
            value={formData.nationalite || ""}
            onChange={(e) => setFormData({ ...formData, nationalite: e.target.value })}
          />
        </DialogBody>
        <DialogFooter>
          <Button
            variant="text"
            color="red"
            onClick={() => setEditDialog(false)}
            className="mr-1"
          >
            Cancel
          </Button>
          <Button variant="gradient" color="green" onClick={handleSave}>
            Save Changes
          </Button>
        </DialogFooter>
      </Dialog>
    </>
  );
}

export default Users;

