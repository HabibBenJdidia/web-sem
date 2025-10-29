import React, { useState, useEffect } from "react";
import { getEmpreinteCarbone, createEmpreinteCarbone, updateEmpreinteCarbone, deleteEmpreinteCarbone } from "@/services/empreinteCarboneService";

function EmpreinteCarbone() {
  const [empreinteCarboneList, setEmpreinteCarboneList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    valeur_co2_kg: ''
  });
  const [submitLoading, setSubmitLoading] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [showEditForm, setShowEditForm] = useState(false);
  const [editFormData, setEditFormData] = useState({
    valeur_co2_kg: ''
  });
  const [editLoading, setEditLoading] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(null);

  useEffect(() => {
    const fetchEmpreinteCarbone = async () => {
      try {
        const data = await getEmpreinteCarbone();
        setEmpreinteCarboneList(data);
      } catch (err) {
        setError(err);
      } finally {
        setLoading(false);
      }
    };

    fetchEmpreinteCarbone();
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitLoading(true);
    setError(null);

    try {
      // Validate input
      if (!formData.valeur_co2_kg || isNaN(parseFloat(formData.valeur_co2_kg))) {
        throw new Error('Please enter a valid CO2 value');
      }

      if (parseFloat(formData.valeur_co2_kg) < 0) {
        throw new Error('CO2 value cannot be negative');
      }

      const newEntry = await createEmpreinteCarbone({
        valeur_co2_kg: parseFloat(formData.valeur_co2_kg)
      });
      
      // Refresh the list
      const updatedList = await getEmpreinteCarbone();
      setEmpreinteCarboneList(updatedList);
      
      // Reset form and close it
      setFormData({ valeur_co2_kg: '' });
      setShowForm(false);
    } catch (err) {
      setError(err.message || 'Failed to create entry');
    } finally {
      setSubmitLoading(false);
    }
  };

  const handleEdit = (entry) => {
    setEditingId(entry.id);
    setEditFormData({
      valeur_co2_kg: entry.valeur_co2_kg
    });
    setShowEditForm(true);
  };

  const handleEditInputChange = (e) => {
    const { name, value } = e.target;
    setEditFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    setEditLoading(true);
    setError(null);

    try {
      // Validate input
      if (!editFormData.valeur_co2_kg || isNaN(parseFloat(editFormData.valeur_co2_kg))) {
        throw new Error('Please enter a valid CO2 value');
      }

      if (parseFloat(editFormData.valeur_co2_kg) < 0) {
        throw new Error('CO2 value cannot be negative');
      }

      await updateEmpreinteCarbone(editingId, {
        valeur_co2_kg: parseFloat(editFormData.valeur_co2_kg)
      });
      
      // Refresh the list
      const updatedList = await getEmpreinteCarbone();
      setEmpreinteCarboneList(updatedList);
      
      // Reset edit form and close it
      setEditingId(null);
      setEditFormData({ valeur_co2_kg: '' });
      setShowEditForm(false);
    } catch (err) {
      setError(err.message || 'Failed to update entry');
    } finally {
      setEditLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this entry?')) {
      setDeleteLoading(id);
      setError(null);
      try {
        await deleteEmpreinteCarbone(id);
        // Refresh the list
        const updatedList = await getEmpreinteCarbone();
        setEmpreinteCarboneList(updatedList);
      } catch (err) {
        setError(err.message || 'Failed to delete entry');
      } finally {
        setDeleteLoading(null);
      }
    }
  };

  if (loading) {
    return <div className="mt-12">Loading...</div>;
  }

  if (error) {
    return <div className="mt-12">Error: {error.message}</div>;
  }

  return (
    <div className="mt-12">
      <div className="mb-4 grid grid-cols-1 gap-6 xl:grid-cols-3">
        <div className="relative flex flex-col bg-clip-border rounded-xl bg-white text-gray-700 shadow-md overflow-hidden xl:col-span-3">
          <div className="p-6">
            <div className="flex justify-between items-center mb-6">
              <div>
                <h4 className="block antialiased tracking-normal font-sans text-2xl font-semibold leading-snug text-blue-gray-900 mb-1">Empreinte Carbone Page</h4>
                <p className="antialiased font-sans text-sm leading-normal text-blue-gray-600 font-normal">
                  List of Empreinte Carbone Entries:
                </p>
              </div>
              <button
                onClick={() => setShowForm(!showForm)}
                className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded"
              >
                {showForm ? 'Cancel' : 'Add New Entry'}
              </button>
            </div>

            {/* Add Form */}
            {showForm && (
              <div className="mb-6 p-4 border rounded-md bg-gray-50">
                <h5 className="text-lg font-semibold mb-4">Add New Empreinte Carbone Entry</h5>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Valeur CO2 (kg)</label>
                    <input
                      type="number"
                      name="valeur_co2_kg"
                      value={formData.valeur_co2_kg}
                      onChange={handleInputChange}
                      required
                      step="0.01"
                      min="0"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Enter CO2 value in kg"
                    />
                  </div>
                  <div className="flex gap-2">
                    <button
                      type="submit"
                      disabled={submitLoading}
                      className="bg-green-500 hover:bg-green-600 disabled:bg-gray-400 text-white font-bold py-2 px-4 rounded"
                    >
                      {submitLoading ? 'Adding...' : 'Add Entry'}
                    </button>
                    <button
                      type="button"
                      onClick={() => setShowForm(false)}
                      className="bg-gray-500 hover:bg-gray-600 text-white font-bold py-2 px-4 rounded"
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              </div>
            )}

            {/* Error Display */}
            {error && (
              <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
                {error}
              </div>
            )}

            {/* Edit Form */}
            {showEditForm && (
              <div className="mb-6 p-4 border rounded-md bg-blue-50">
                <h5 className="text-lg font-semibold mb-4">Edit Empreinte Carbone Entry</h5>
                <form onSubmit={handleEditSubmit} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">CO2 Value (kg)</label>
                    <input
                      type="number"
                      name="valeur_co2_kg"
                      value={editFormData.valeur_co2_kg}
                      onChange={handleEditInputChange}
                      required
                      step="0.01"
                      min="0"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Enter CO2 value in kg"
                    />
                  </div>
                  <div className="flex gap-2">
                    <button
                      type="submit"
                      disabled={editLoading}
                      className="bg-yellow-500 hover:bg-yellow-600 disabled:bg-gray-400 text-white font-bold py-2 px-4 rounded"
                    >
                      {editLoading ? 'Updating...' : 'Update Entry'}
                    </button>
                    <button
                      type="button"
                      onClick={() => setShowEditForm(false)}
                      className="bg-gray-500 hover:bg-gray-600 text-white font-bold py-2 px-4 rounded"
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              </div>
            )}

            {/* List of Entries */}
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ID</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Valeur CO2 (kg)</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {empreinteCarboneList.map((entry) => (
                    <tr key={entry.id} className="bg-white border-b">
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {entry.id}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {entry.valeur_co2_kg}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        <button
                          onClick={() => handleEdit(entry)}
                          className="text-blue-600 hover:text-blue-900 mr-3"
                          disabled={editLoading}
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleDelete(entry.id)}
                          className="text-red-600 hover:text-red-900"
                          disabled={deleteLoading === entry.id}
                        >
                          {deleteLoading === entry.id ? 'Deleting...' : 'Delete'}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {empreinteCarboneList.length === 0 && !loading && !error && (
              <p className="mt-4">No Empreinte Carbone entries found.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default EmpreinteCarbone;