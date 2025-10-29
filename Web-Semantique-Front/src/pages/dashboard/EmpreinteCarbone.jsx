import React, { useState, useEffect } from "react";
import { getEmpreinteCarbone, createEmpreinteCarbone, updateEmpreinteCarbone, deleteEmpreinteCarbone } from "@/services/empreinteCarboneService";

function EmpreinteCarbone() {
  const [empreinteCarboneList, setEmpreinteCarboneList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    valeur_co2_kg: '',
    name: '',
    description: '',
    image: ''
  });
  const [submitLoading, setSubmitLoading] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [showEditForm, setShowEditForm] = useState(false);
  const [editFormData, setEditFormData] = useState({
    valeur_co2_kg: '',
    name: '',
    description: '',
    image: ''
  });
  const [editLoading, setEditLoading] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(null);
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [editImageFile, setEditImageFile] = useState(null);
  const [editImagePreview, setEditImagePreview] = useState(null);
  const [editUploadProgress, setEditUploadProgress] = useState(0);

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

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Validate file type
      const validTypes = ['image/jpeg', 'image/jpg', 'image/png'];
      if (!validTypes.includes(file.type)) {
        setError('Please select a valid image file (JPG, JPEG, or PNG)');
        return;
      }
      
      // Validate file size (5MB limit)
      const maxSize = 5 * 1024 * 1024; // 5MB
      if (file.size > maxSize) {
        setError('Image file size must be less than 5MB');
        return;
      }
      
      setImageFile(file);
      
      // Create preview
      const reader = new FileReader();
      reader.onload = (e) => {
        setImagePreview(e.target.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleEditImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Validate file type
      const validTypes = ['image/jpeg', 'image/jpg', 'image/png'];
      if (!validTypes.includes(file.type)) {
        setError('Please select a valid image file (JPG, JPEG, or PNG)');
        return;
      }
      
      // Validate file size (5MB limit)
      const maxSize = 5 * 1024 * 1024; // 5MB
      if (file.size > maxSize) {
        setError('Image file size must be less than 5MB');
        return;
      }
      
      setEditImageFile(file);
      
      // Create preview
      const reader = new FileReader();
      reader.onload = (e) => {
        setEditImagePreview(e.target.result);
      };
      reader.readAsDataURL(file);
    }
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

      if (!formData.name || formData.name.trim() === '') {
        throw new Error('Please enter a name');
      }

      if (formData.name.length > 255) {
        throw new Error('Name must be less than 255 characters');
      }

      if (formData.description && formData.description.length > 1000) {
        throw new Error('Description must be less than 1000 characters');
      }

      // Create FormData for multipart upload if image file is selected
      let submitData;
      if (imageFile) {
        const formDataObj = new FormData();
        formDataObj.append('valeur_co2_kg', parseFloat(formData.valeur_co2_kg));
        formDataObj.append('name', formData.name.trim());
        formDataObj.append('description', formData.description.trim());
        formDataObj.append('image', imageFile);
        submitData = formDataObj;
      } else {
        submitData = {
          valeur_co2_kg: parseFloat(formData.valeur_co2_kg),
          name: formData.name.trim(),
          description: formData.description.trim(),
          image: formData.image.trim()
        };
      }

      const newEntry = await createEmpreinteCarbone(submitData);
      
      // Refresh the list
      const updatedList = await getEmpreinteCarbone();
      setEmpreinteCarboneList(updatedList);
      
      // Reset form and close it
      setFormData({ valeur_co2_kg: '', name: '', description: '', image: '' });
      setImageFile(null);
      setImagePreview(null);
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
      valeur_co2_kg: entry.valeur_co2_kg,
      name: entry.name || '',
      description: entry.description || '',
      image: entry.image || ''
    });
    setEditImagePreview(entry.image || null);
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

      if (!editFormData.name || editFormData.name.trim() === '') {
        throw new Error('Please enter a name');
      }

      if (editFormData.name.length > 255) {
        throw new Error('Name must be less than 255 characters');
      }

      if (editFormData.description && editFormData.description.length > 1000) {
        throw new Error('Description must be less than 1000 characters');
      }

      // Create FormData for multipart upload if image file is selected
      let submitData;
      if (editImageFile) {
        const formDataObj = new FormData();
        formDataObj.append('valeur_co2_kg', parseFloat(editFormData.valeur_co2_kg));
        formDataObj.append('name', editFormData.name.trim());
        formDataObj.append('description', editFormData.description.trim());
        formDataObj.append('image', editImageFile);
        submitData = formDataObj;
      } else {
        submitData = {
          valeur_co2_kg: parseFloat(editFormData.valeur_co2_kg),
          name: editFormData.name.trim(),
          description: editFormData.description.trim(),
          image: editFormData.image.trim()
        };
      }

      await updateEmpreinteCarbone(editingId, submitData);
      
      // Refresh the list
      const updatedList = await getEmpreinteCarbone();
      setEmpreinteCarboneList(updatedList);
      
      // Reset edit form and close it
      setEditingId(null);
      setEditFormData({ valeur_co2_kg: '', name: '', description: '', image: '' });
      setEditImageFile(null);
      setEditImagePreview(null);
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
                    <label className="block text-sm font-medium text-gray-700 mb-1">Name *</label>
                    <input
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleInputChange}
                      required
                      maxLength="255"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Enter entry name"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Valeur CO2 (kg) *</label>
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
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                    <textarea
                      name="description"
                      value={formData.description}
                      onChange={handleInputChange}
                      rows="3"
                      maxLength="1000"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Enter description (optional)"
                    />
                    <p className="text-xs text-gray-500 mt-1">{formData.description.length}/1000 characters</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Image</label>
                    <div className="flex flex-col space-y-2">
                      <input
                        type="file"
                        accept="image/jpeg,image/jpg,image/png"
                        onChange={handleImageUpload}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                      {imagePreview && (
                        <div className="mt-2">
                          <img
                            src={imagePreview}
                            alt="Preview"
                            className="max-w-32 max-h-32 object-cover rounded-md border"
                          />
                        </div>
                      )}
                      {formData.image && !imagePreview && (
                        <div className="mt-2">
                          <p className="text-sm text-gray-600">Current image URL: {formData.image}</p>
                        </div>
                      )}
                    </div>
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
                    <label className="block text-sm font-medium text-gray-700 mb-1">Name *</label>
                    <input
                      type="text"
                      name="name"
                      value={editFormData.name}
                      onChange={handleEditInputChange}
                      required
                      maxLength="255"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Enter entry name"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">CO2 Value (kg) *</label>
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
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                    <textarea
                      name="description"
                      value={editFormData.description}
                      onChange={handleEditInputChange}
                      rows="3"
                      maxLength="1000"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Enter description (optional)"
                    />
                    <p className="text-xs text-gray-500 mt-1">{editFormData.description.length}/1000 characters</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Image</label>
                    <div className="flex flex-col space-y-2">
                      <input
                        type="file"
                        accept="image/jpeg,image/jpg,image/png"
                        onChange={handleEditImageUpload}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                      {editImagePreview && (
                        <div className="mt-2">
                          <img
                            src={editImagePreview}
                            alt="Preview"
                            className="max-w-32 max-h-32 object-cover rounded-md border"
                          />
                        </div>
                      )}
                      {editFormData.image && !editImagePreview && (
                        <div className="mt-2">
                          <p className="text-sm text-gray-600">Current image URL: {editFormData.image}</p>
                        </div>
                      )}
                    </div>
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
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Valeur CO2 (kg)</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Description</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Image</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {empreinteCarboneList.map((entry) => (
                    <tr key={entry.id} className="bg-white border-b hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {entry.id}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {entry.name}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {entry.valeur_co2_kg}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-900 max-w-xs truncate">
                        {entry.description || '-'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {entry.image ? (
                          <img
                            src={entry.image}
                            alt={entry.name}
                            className="w-12 h-12 object-cover rounded-md border"
                            onError={(e) => {
                              e.target.style.display = 'none';
                              e.target.nextSibling.style.display = 'block';
                            }}
                          />
                        ) : (
                          <span className="text-gray-400">No image</span>
                        )}
                        <span className="text-gray-400 hidden">No image</span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 space-x-2">
                        <button
                          onClick={() => handleEdit(entry)}
                          className="text-yellow-600 hover:text-yellow-900 bg-yellow-100 hover:bg-yellow-200 px-3 py-1 rounded-md text-xs"
                          disabled={editLoading}
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleDelete(entry.id)}
                          className="text-red-600 hover:text-red-900 bg-red-100 hover:bg-red-200 px-3 py-1 rounded-md text-xs disabled:opacity-50"
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