import React, { useState, useEffect } from 'react';
import {
  Card,
  CardHeader,
  CardBody,
  Typography,
  Button,
  Dialog,
  DialogHeader,
  DialogBody,
  DialogFooter,
  Input,
  Select,
  Option,
  Chip,
  IconButton,
  Spinner,
  Alert,
} from "@material-tailwind/react";
import {
  PlusIcon,
  MagnifyingGlassIcon,
  PencilIcon,
  TrashIcon,
  MapIcon,
  CheckCircleIcon,
  ExclamationCircleIcon,
} from "@heroicons/react/24/solid";
import api from '@/services/api';

export function ZonesAdmin() {
  const [zones, setZones] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [openDialog, setOpenDialog] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [currentZone, setCurrentZone] = useState(null);
  const [alert, setAlert] = useState({ show: false, message: '', type: 'success' });
  const [errors, setErrors] = useState({});
  const [formData, setFormData] = useState({
    nom: '',
    type: 'Parc National'
  });

  useEffect(() => {
    loadZones();
  }, []);

  const showAlert = (message, type = 'success') => {
    setAlert({ show: true, message, type });
    setTimeout(() => setAlert({ show: false, message: '', type: 'success' }), 5000);
  };

  const loadZones = async () => {
    try {
      setLoading(true);
      const data = await api.getZonesNaturelles();
      setZones(parseZones(data));
    } catch (error) {
      console.error('Error loading zones:', error);
      showAlert('Error loading zones: ' + error.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  const parseZones = (data) => {
    const zonesMap = {};
    
    data.forEach(item => {
      const uri = item.s?.value;
      const predicate = item.p?.value;
      const object = item.o?.value;
      
      if (!uri) return;
      
      if (!zonesMap[uri]) {
        zonesMap[uri] = { uri };
      }
      
      const propName = predicate?.split('#')[1];
      
      // Extract only string values, not URIs
      if (propName === 'nom') {
        // If object is a URI, extract the last part, otherwise use as is
        if (object && object.startsWith('http')) {
          zonesMap[uri].nom = object.split('#').pop().split('/').pop();
        } else {
          zonesMap[uri].nom = object;
        }
      }
      if (propName === 'type') {
        // Same for type
        if (object && object.startsWith('http')) {
          zonesMap[uri].type = object.split('#').pop().split('/').pop();
        } else {
          zonesMap[uri].type = object;
        }
      }
    });
    
    return Object.values(zonesMap).filter(z => z.nom);
  };

  const validateField = (name, value) => {
    const newErrors = { ...errors };
    
    if (name === 'nom') {
      if (!value.trim()) {
        newErrors.nom = 'Zone name is required';
      } else if (value.trim().length < 3) {
        newErrors.nom = 'Name must be at least 3 characters';
      } else if (value.trim().length > 100) {
        newErrors.nom = 'Name must not exceed 100 characters';
      } else if (!/^[a-zA-ZÀ-ÿ0-9\s\-']+$/.test(value.trim())) {
        newErrors.nom = 'Only letters, numbers, spaces, and hyphens allowed';
      } else {
        delete newErrors.nom;
      }
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleFieldChange = (name, value) => {
    setFormData({ ...formData, [name]: value });
    validateField(name, value);
  };

  const handleOpenDialog = (zone = null) => {
    setErrors({});
    if (zone) {
      setEditMode(true);
      setCurrentZone(zone);
      setFormData({
        nom: zone.nom || '',
        type: zone.type || 'Parc National'
      });
    } else {
      setEditMode(false);
      setCurrentZone(null);
      setFormData({
        nom: '',
        type: 'Parc National'
      });
    }
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setEditMode(false);
    setCurrentZone(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validate name field
    const isNomValid = validateField('nom', formData.nom);
    
    if (!isNomValid) {
      showAlert('Please fix all errors before submitting', 'error');
      return;
    }
    
    try {
      let cleanNom = formData.nom.trim();
      if (cleanNom.startsWith('http')) {
        cleanNom = cleanNom.split('#').pop().split('/').pop();
      }
      
      const data = {
        nom: cleanNom,
        type: formData.type
      };

      console.log('Sending data:', data);

      if (editMode && currentZone) {
        await api.updateZoneNaturelle(currentZone.uri, data);
        showAlert('Natural zone updated successfully!', 'success');
      } else {
        await api.createZoneNaturelle(data);
        showAlert('Natural zone created successfully!', 'success');
      }
      
      await loadZones();
      handleCloseDialog();
    } catch (error) {
      console.error('Error saving zone:', error);
      showAlert('Error saving natural zone: ' + error.message, 'error');
    }
  };

  const handleDelete = async (uri) => {
    const zone = zones.find(z => z.uri === uri);
    const zoneName = zone?.nom || 'this zone';
    
    if (!window.confirm(`Are you sure you want to delete "${zoneName}"?\n\nThis action cannot be undone and may affect related activities.`)) {
      return;
    }
    
    try {
      showAlert('Deleting natural zone...', 'info');
      await api.deleteZoneNaturelle(uri);
      showAlert(`"${zoneName}" has been deleted successfully!`, 'success');
      await loadZones();
    } catch (error) {
      console.error('Error deleting zone:', error);
      showAlert(`Failed to delete "${zoneName}". ${error.message}`, 'error');
    }
  };

  const getTypeColor = (type) => {
    const colors = {
      'Parc National': 'green',
      'Réserve Naturelle': 'blue',
      'Forêt': 'teal',
      'Montagne': 'gray',
      'Plage': 'cyan',
      'Désert': 'amber',
      'Lac': 'light-blue',
      'Rivière': 'blue-gray',
    };
    return colors[type] || 'gray';
  };

  const getTypeIcon = (type) => {
    const icons = {
      'Parc National': '🏞️',
      'Réserve Naturelle': '🌳',
      'Forêt': '🌲',
      'Montagne': '⛰️',
      'Plage': '🏖️',
      'Désert': '🏜️',
      'Lac': '🏞️',
      'Rivière': '🌊',
    };
    return icons[type] || '🗺️';
  };

  const filteredZones = zones.filter(zone =>
    zone.nom?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    zone.type?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Spinner className="h-12 w-12" />
      </div>
    );
  }

  return (
    <div className="mt-12">
      {alert.show && (
        <Alert
          color={alert.type === 'success' ? 'green' : 'red'}
          icon={alert.type === 'success' ? <CheckCircleIcon className="h-6 w-6" /> : <ExclamationCircleIcon className="h-6 w-6" />}
          className="mb-6"
        >
          {alert.message}
        </Alert>
      )}

      <Card>
        <CardHeader variant="gradient" color="green" className="mb-8 p-6">
          <div className="flex items-center justify-between">
            <div>
              <Typography variant="h6" color="white">
                🌳 Natural Zones Management (Admin)
              </Typography>
              <Typography variant="small" color="white" className="opacity-80">
                Total: {zones.length} zones
              </Typography>
            </div>
            <Button
              size="sm"
              color="white"
              className="flex items-center gap-2"
              onClick={() => handleOpenDialog()}
            >
              <PlusIcon className="h-4 w-4" />
              Add Zone
            </Button>
          </div>
        </CardHeader>
        <CardBody>
          <div className="mb-6">
            <Input
              label="Search natural zones..."
              icon={<MagnifyingGlassIcon className="h-5 w-5" />}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          <div className="overflow-x-auto">
            <table className="w-full min-w-max table-auto text-left">
              <thead>
                <tr>
                  <th className="border-b border-blue-gray-100 bg-blue-gray-50 p-4">
                    <Typography variant="small" color="blue-gray" className="font-bold leading-none">
                      Icon
                    </Typography>
                  </th>
                  <th className="border-b border-blue-gray-100 bg-blue-gray-50 p-4">
                    <Typography variant="small" color="blue-gray" className="font-bold leading-none">
                      Name
                    </Typography>
                  </th>
                  <th className="border-b border-blue-gray-100 bg-blue-gray-50 p-4">
                    <Typography variant="small" color="blue-gray" className="font-bold leading-none">
                      Type
                    </Typography>
                  </th>
                  <th className="border-b border-blue-gray-100 bg-blue-gray-50 p-4">
                    <Typography variant="small" color="blue-gray" className="font-bold leading-none">
                      Actions
                    </Typography>
                  </th>
                </tr>
              </thead>
              <tbody>
                {filteredZones.map((zone, index) => {
                  const isLast = index === filteredZones.length - 1;
                  const classes = isLast ? "p-4" : "p-4 border-b border-blue-gray-50";

                  return (
                    <tr key={zone.uri}>
                      <td className={classes}>
                        <span className="text-3xl">{getTypeIcon(zone.type)}</span>
                      </td>
                      <td className={classes}>
                        <Typography variant="small" color="blue-gray" className="font-bold">
                          {zone.nom}
                        </Typography>
                      </td>
                      <td className={classes}>
                        <Chip
                          value={zone.type}
                          color={getTypeColor(zone.type)}
                          size="sm"
                          icon={<MapIcon className="h-4 w-4" />}
                        />
                      </td>
                      <td className={classes}>
                        <div className="flex gap-2">
                          <IconButton
                            size="sm"
                            color="blue"
                            variant="text"
                            onClick={() => handleOpenDialog(zone)}
                          >
                            <PencilIcon className="h-4 w-4" />
                          </IconButton>
                          <IconButton
                            size="sm"
                            color="red"
                            variant="text"
                            onClick={() => handleDelete(zone.uri)}
                          >
                            <TrashIcon className="h-4 w-4" />
                          </IconButton>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {filteredZones.length === 0 && !loading && (
            <div className="text-center py-12">
              <MapIcon className="h-16 w-16 mx-auto mb-4 text-gray-400" />
              <Typography variant="h6" color="gray" className="mb-2">
                {searchTerm ? 'No zones match your search' : 'No natural zones yet'}
              </Typography>
              <Typography variant="small" color="gray">
                {searchTerm ? 'Try adjusting your search terms' : 'Click "Add Zone" to create your first natural zone'}
              </Typography>
            </div>
          )}
        </CardBody>
      </Card>

      {/* Add/Edit Dialog */}
      <Dialog open={openDialog} handler={handleCloseDialog} size="md">
        <DialogHeader>
          {editMode ? 'Edit Natural Zone' : 'Add New Natural Zone'}
        </DialogHeader>
        <form onSubmit={handleSubmit} noValidate>
          <DialogBody divider className="space-y-4">
            <div>
              <Input
                label="Zone Name *"
                value={formData.nom}
                onChange={(e) => handleFieldChange('nom', e.target.value)}
                error={!!errors.nom}
              />
              {errors.nom && (
                <Typography variant="small" color="red" className="mt-1 flex items-center gap-1">
                  <ExclamationCircleIcon className="h-4 w-4" />
                  {errors.nom}
                </Typography>
              )}
            </div>

            <Select
              label="Zone Type *"
              value={formData.type}
              onChange={(value) => setFormData({ ...formData, type: value })}
            >
              <Option value="Parc National">🏞️ National Park (Parc National)</Option>
              <Option value="Réserve Naturelle">🌳 Nature Reserve (Réserve Naturelle)</Option>
              <Option value="Forêt">🌲 Forest (Forêt)</Option>
              <Option value="Montagne">⛰️ Mountain (Montagne)</Option>
              <Option value="Plage">🏖️ Beach (Plage)</Option>
              <Option value="Désert">🏜️ Desert (Désert)</Option>
              <Option value="Lac">🏞️ Lake (Lac)</Option>
              <Option value="Rivière">🌊 River (Rivière)</Option>
            </Select>
          </DialogBody>
          <DialogFooter>
            <Button
              variant="text"
              color="red"
              onClick={handleCloseDialog}
              className="mr-2"
            >
              Cancel
            </Button>
            <Button type="submit" variant="gradient" color="green">
              {editMode ? 'Update' : 'Create'}
            </Button>
          </DialogFooter>
        </form>
      </Dialog>
    </div>
  );
}

export default ZonesAdmin;
