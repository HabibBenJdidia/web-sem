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
  Select,
  Option,
} from "@material-tailwind/react";
import { PencilIcon, TrashIcon, UserCircleIcon, PlusIcon } from "@heroicons/react/24/outline";
import api from "@/services/api";
import { useAuth } from "@/context/AuthContext";
import { countries } from "@/data/countries";

export function Users() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editDialog, setEditDialog] = useState(false);
  const [createDialog, setCreateDialog] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [formData, setFormData] = useState({});
  const [ageWarning, setAgeWarning] = useState(null);
  const { user: currentUser } = useAuth();

  // Calculate age from birth date
  const calculateAge = (birthDate) => {
    const today = new Date();
    const birth = new Date(birthDate);
    let age = today.getFullYear() - birth.getFullYear();
    const monthDiff = today.getMonth() - birth.getMonth();
    
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
      age--;
    }
    
    return age;
  };

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
    // Calculate birth date from age if available
    let birthDate = "";
    if (user.age) {
      const today = new Date();
      const birthYear = today.getFullYear() - parseInt(user.age);
      birthDate = `${birthYear}-01-01`; // Approximate birth date
    }
    
    setFormData({
      nom: user.nom || "",
      age: user.age || "",
      birthDate: birthDate,
      nationalite: user.nationalite || "",
      email: user.email || "",
    });
    setAgeWarning(null);
    setEditDialog(true);
  };

  const handleSave = async () => {
    try {
      if (!formData.nom || !formData.email) {
        alert("Name and email are required");
        return;
      }

      if (formData.age && parseInt(formData.age) < 18) {
        alert("User must be at least 18 years old");
        return;
      }

      const uri = selectedUser.uri;
      const endpoint = selectedUser.type === 'Guide' ? 'guide' : 'touriste';
      
      // Update user data via the specific endpoint
      await api.fetch(`/${endpoint}/${encodeURIComponent(uri)}`, {
        method: 'PUT',
        body: JSON.stringify({
          nom: formData.nom,
          age: formData.age,
          nationalite: formData.nationalite,
          email: formData.email
        }),
      });
      
      setEditDialog(false);
      setAgeWarning(null);
      loadUsers();
    } catch (error) {
      console.error("Error updating user:", error);
      alert("Failed to update user: " + (error.message || "Unknown error"));
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

  const handleCreateUser = () => {
    setFormData({
      nom: "",
      email: "",
      password: "",
      birthDate: "",
      age: "",
      nationalite: "",
      type: "Touriste"
    });
    setAgeWarning(null);
    setCreateDialog(true);
  };

  const handleBirthDateChange = (value) => {
    const age = calculateAge(value);
    
    if (age < 18) {
      setAgeWarning("User must be at least 18 years old");
      setFormData({ ...formData, birthDate: value, age: "" });
    } else {
      setAgeWarning(null);
      setFormData({ ...formData, birthDate: value, age: age.toString() });
    }
  };

  const handleSaveCreate = async () => {
    try {
      if (!formData.nom || !formData.email || !formData.password) {
        alert("Please fill in all required fields");
        return;
      }

      if (!formData.age || parseInt(formData.age) < 18) {
        alert("User must be at least 18 years old");
        return;
      }

      if (!formData.nationalite) {
        alert("Please select a nationality");
        return;
      }

      // Use the auth/register endpoint which handles email, password, and RDF creation
      await api.fetch('/auth/register', {
        method: 'POST',
        body: JSON.stringify({
          nom: formData.nom,
          email: formData.email,
          password: formData.password,
          age: formData.age,
          nationalite: formData.nationalite,
          type: formData.type === 'Guide' ? 'guide' : 'touriste'
        }),
      });
      
      setCreateDialog(false);
      setAgeWarning(null);
      loadUsers();
    } catch (error) {
      console.error("Error creating user:", error);
      alert("Failed to create user: " + (error.message || "Unknown error"));
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
              <div>
                <Typography variant="h6" color="white">
                  Users Management
                </Typography>
                <Typography variant="small" color="white" className="opacity-80 mt-1">
                  Total: {users.length} users
                </Typography>
              </div>
              <Button
                color="white"
                size="sm"
                className="flex items-center gap-2"
                onClick={handleCreateUser}
              >
                <PlusIcon className="h-4 w-4" />
                New User
              </Button>
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
                          <div className="h-9 w-9 rounded-md bg-gradient-to-tr from-blue-gray-600 to-blue-gray-400 flex items-center justify-center">
                            <UserCircleIcon className="h-6 w-6 text-white" />
                          </div>
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

      {/* Create Dialog */}
      <Dialog 
        open={createDialog} 
        handler={() => setCreateDialog(!createDialog)}
        size="md"
        className="bg-white shadow-2xl"
        animate={{
          mount: { scale: 1, y: 0 },
          unmount: { scale: 0.9, y: -100 },
        }}
      >
        <DialogHeader className="bg-white">New User</DialogHeader>
        <DialogBody divider className="flex flex-col gap-4 max-h-[60vh] overflow-y-auto">
          {ageWarning && (
            <div className="bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded flex items-center gap-2">
              <svg width="20" height="20" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
              {ageWarning}
            </div>
          )}
          <Input
            label="Name *"
            value={formData.nom || ""}
            onChange={(e) => setFormData({ ...formData, nom: e.target.value })}
            required
          />
          <Input
            label="Email *"
            type="email"
            value={formData.email || ""}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            required
          />
          <Input
            label="Password *"
            type="password"
            value={formData.password || ""}
            onChange={(e) => setFormData({ ...formData, password: e.target.value })}
            required
          />
          <Select
            label="User Type *"
            value={formData.type || "Touriste"}
            onChange={(value) => setFormData({ ...formData, type: value })}
            key={`create-type-${createDialog}`}
          >
            <Option value="Touriste">Tourist</Option>
            <Option value="Guide">Guide</Option>
          </Select>
          <div>
            <Input
              label="Birth Date *"
              type="date"
              value={formData.birthDate || ""}
              onChange={(e) => handleBirthDateChange(e.target.value)}
              max={new Date().toISOString().split('T')[0]}
              required
            />
            {formData.age && (
              <Typography variant="small" color="blue-gray" className="mt-1">
                Age: {formData.age} years old
              </Typography>
            )}
          </div>
          <Select
            label="Nationality *"
            value={formData.nationalite || ""}
            onChange={(value) => setFormData({ ...formData, nationalite: value })}
            key={`create-nationality-${createDialog}`}
          >
            {countries.map((country) => (
              <Option key={country.code} value={country.nationality}>
                {country.nationality} ({country.name})
              </Option>
            ))}
          </Select>
          <Typography variant="small" color="gray" className="mt-2">
            * Required fields
          </Typography>
        </DialogBody>
        <DialogFooter>
          <Button
            variant="text"
            color="red"
            onClick={() => setCreateDialog(false)}
            className="mr-1"
          >
            Cancel
          </Button>
          <Button 
            variant="gradient" 
            color="green" 
            onClick={handleSaveCreate}
            disabled={!formData.nom || !formData.email || !formData.password || !formData.age || !formData.nationalite}
          >
            Create
          </Button>
        </DialogFooter>
      </Dialog>

      {/* Edit Dialog */}
      <Dialog 
        open={editDialog} 
        handler={() => setEditDialog(!editDialog)}
        size="md"
        className="bg-white shadow-2xl"
        animate={{
          mount: { scale: 1, y: 0 },
          unmount: { scale: 0.9, y: -100 },
        }}
      >
        <DialogHeader className="bg-white">Edit User</DialogHeader>
        <DialogBody divider className="flex flex-col gap-4 max-h-[60vh] overflow-y-auto">
          {ageWarning && (
            <div className="bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded flex items-center gap-2">
              <svg width="20" height="20" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
              {ageWarning}
            </div>
          )}
          <Input
            label="Name *"
            value={formData.nom || ""}
            onChange={(e) => setFormData({ ...formData, nom: e.target.value })}
            required
          />
          <Input
            label="Email *"
            type="email"
            value={formData.email || ""}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            disabled
            className="bg-blue-gray-50"
          />
          <Typography variant="small" color="gray" className="-mt-2">
            Email cannot be changed
          </Typography>
          <div>
            <Input
              label="Birth Date"
              type="date"
              value={formData.birthDate || ""}
              onChange={(e) => handleBirthDateChange(e.target.value)}
              max={new Date().toISOString().split('T')[0]}
            />
            {formData.age && (
              <Typography variant="small" color="blue-gray" className="mt-1">
                Age: {formData.age} years old
              </Typography>
            )}
          </div>
          <Select
            label="Nationality"
            value={formData.nationalite || ""}
            onChange={(value) => setFormData({ ...formData, nationalite: value })}
            key={`edit-nationality-${editDialog}-${selectedUser?.uri}`}
          >
            {countries.map((country) => (
              <Option key={country.code} value={country.nationality}>
                {country.nationality} ({country.name})
              </Option>
            ))}
          </Select>
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
          <Button 
            variant="gradient" 
            color="green" 
            onClick={handleSave}
            disabled={!formData.nom || !formData.email}
          >
            Save Changes
          </Button>
        </DialogFooter>
      </Dialog>
    </>
  );
}

export default Users;

