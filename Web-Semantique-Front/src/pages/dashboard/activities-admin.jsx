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
  MapPinIcon,
  ClockIcon,
  CurrencyDollarIcon,
  CheckCircleIcon,
  ExclamationCircleIcon,
  SparklesIcon,
} from "@heroicons/react/24/solid";
import api from '@/services/api';

export function ActivitiesAdmin() {
  const [activities, setActivities] = useState([]);
  const [zones, setZones] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [openDialog, setOpenDialog] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [currentActivity, setCurrentActivity] = useState(null);
  const [alert, setAlert] = useState({ show: false, message: '', type: 'success' });
  const [errors, setErrors] = useState({});
  const [formData, setFormData] = useState({
    nom: '',
    difficulte: 'Facile',
    duree_heures: '',
    prix: '',
    est_dans_zone: ''
  });

  useEffect(() => {
    loadData();
  }, []);

  const showAlert = (message, type = 'success') => {
    setAlert({ show: true, message, type });
    setTimeout(() => setAlert({ show: false, message: '', type: 'success' }), 5000);
  };

  const loadData = async () => {
    try {
      setLoading(true);
      const [activitesData, zonesData] = await Promise.all([
        api.getActivites(),
        api.getZonesNaturelles()
      ]);
      
      setActivities(parseActivities(activitesData));
      setZones(parseZones(zonesData));
    } catch (error) {
      console.error('Error loading data:', error);
      showAlert('Error loading data: ' + error.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  const parseActivities = (data) => {
    const activitiesMap = {};
    
    data.forEach(item => {
      const uri = item.s?.value;
      const predicate = item.p?.value;
      const object = item.o?.value;
      
      if (!uri) return;
      
      if (!activitiesMap[uri]) {
        activitiesMap[uri] = { uri };
      }
      
      const propName = predicate?.split('#')[1];
      
      // Extract only string values, not URIs
      if (propName === 'nom') {
        if (object && object.startsWith('http')) {
          activitiesMap[uri].nom = object.split('#').pop().split('/').pop();
        } else {
          activitiesMap[uri].nom = object;
        }
      }
      if (propName === 'difficulte') {
        if (object && object.startsWith('http')) {
          activitiesMap[uri].difficulte = object.split('#').pop().split('/').pop();
        } else {
          activitiesMap[uri].difficulte = object;
        }
      }
      if (propName === 'dureeHeures') activitiesMap[uri].duree_heures = parseFloat(object);
      if (propName === 'prix') activitiesMap[uri].prix = parseFloat(object);
      if (propName === 'estDansZone') activitiesMap[uri].est_dans_zone = object;
    });
    
    return Object.values(activitiesMap).filter(a => a.nom);
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
        if (object && object.startsWith('http')) {
          zonesMap[uri].nom = object.split('#').pop().split('/').pop();
        } else {
          zonesMap[uri].nom = object;
        }
      }
      if (propName === 'type') {
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
    
    switch (name) {
      case 'nom':
        if (!value.trim()) {
          newErrors.nom = 'Activity name is required';
        } else if (value.trim().length < 3) {
          newErrors.nom = 'Name must be at least 3 characters';
        } else if (value.trim().length > 100) {
          newErrors.nom = 'Name must not exceed 100 characters';
        } else if (!/^[a-zA-ZÀ-ÿ0-9\s\-']+$/.test(value.trim())) {
          newErrors.nom = 'Only letters, numbers, spaces, and hyphens allowed';
        } else {
          delete newErrors.nom;
        }
        break;
        
      case 'duree_heures':
        const duree = parseFloat(value);
        if (!value) {
          newErrors.duree_heures = 'Duration is required';
        } else if (isNaN(duree)) {
          newErrors.duree_heures = 'Duration must be a valid number';
        } else if (duree <= 0) {
          newErrors.duree_heures = 'Duration must be greater than 0';
        } else if (duree > 168) {
          newErrors.duree_heures = 'Duration cannot exceed 1 week (168 hours)';
        } else {
          delete newErrors.duree_heures;
        }
        break;
        
      case 'prix':
        const prix = parseFloat(value);
        if (!value) {
          newErrors.prix = 'Price is required';
        } else if (isNaN(prix)) {
          newErrors.prix = 'Price must be a valid number';
        } else if (prix < 0) {
          newErrors.prix = 'Price cannot be negative';
        } else if (prix > 10000) {
          newErrors.prix = 'Price cannot exceed $10,000';
        } else {
          delete newErrors.prix;
        }
        break;
        
      default:
        break;
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleFieldChange = (name, value) => {
    setFormData({ ...formData, [name]: value });
    validateField(name, value);
  };

  const handleOpenDialog = (activity = null) => {
    setErrors({});
    if (activity) {
      setEditMode(true);
      setCurrentActivity(activity);
      setFormData({
        nom: activity.nom || '',
        difficulte: activity.difficulte || 'Facile',
        duree_heures: activity.duree_heures || '',
        prix: activity.prix || '',
        est_dans_zone: activity.est_dans_zone || ''
      });
    } else {
      setEditMode(false);
      setCurrentActivity(null);
      setFormData({
        nom: '',
        difficulte: 'Facile',
        duree_heures: '',
        prix: '',
        est_dans_zone: ''
      });
    }
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setEditMode(false);
    setCurrentActivity(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validate all fields
    const isNomValid = validateField('nom', formData.nom);
    const isDureeValid = validateField('duree_heures', formData.duree_heures);
    const isPrixValid = validateField('prix', formData.prix);
    
    if (!isNomValid || !isDureeValid || !isPrixValid) {
      showAlert('Please fix all errors before submitting', 'error');
      return;
    }
    
    try {
      let cleanNom = formData.nom.trim();
      if (cleanNom.startsWith('http')) {
        cleanNom = cleanNom.split('#').pop().split('/').pop();
      }
      
      let cleanDifficulte = formData.difficulte;
      if (cleanDifficulte && cleanDifficulte.startsWith('http')) {
        cleanDifficulte = cleanDifficulte.split('#').pop().split('/').pop();
      }
      
      const data = {
        nom: cleanNom,
        difficulte: cleanDifficulte,
        duree_heures: parseFloat(formData.duree_heures),
        prix: parseFloat(formData.prix),
        est_dans_zone: formData.est_dans_zone || undefined
      };

      console.log('Sending data:', data);

      if (editMode && currentActivity) {
        await api.updateActivite(currentActivity.uri, data);
        showAlert('Activity updated successfully!', 'success');
      } else {
        await api.createActivite(data);
        showAlert('Activity created successfully!', 'success');
      }
      
      await loadData();
      handleCloseDialog();
    } catch (error) {
      console.error('Error saving activity:', error);
      showAlert('Error saving activity: ' + error.message, 'error');
    }
  };

  const handleDelete = async (uri) => {
    const activity = activities.find(a => a.uri === uri);
    const activityName = activity?.nom || 'this activity';
    
    if (!window.confirm(`Are you sure you want to delete "${activityName}"?\n\nThis action cannot be undone.`)) {
      return;
    }
    
    try {
      showAlert('Deleting activity...', 'info');
      await api.deleteActivite(uri);
      showAlert(`"${activityName}" has been deleted successfully!`, 'success');
      await loadData();
    } catch (error) {
      console.error('Error deleting activity:', error);
      showAlert(`Failed to delete "${activityName}". ${error.message}`, 'error');
    }
  };

  const getDifficultyColor = (difficulty) => {
    switch (difficulty) {
      case 'Facile': return 'green';
      case 'Moyenne': return 'amber';
      case 'Difficile': return 'red';
      default: return 'gray';
    }
  };

  const getZoneName = (zoneUri) => {
    const zone = zones.find(z => z.uri === zoneUri);
    return zone?.nom || 'Unknown Zone';
  };

  const filteredActivities = activities.filter(activity =>
    activity.nom?.toLowerCase().includes(searchTerm.toLowerCase())
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
        <CardHeader variant="gradient" color="blue" className="mb-8 p-6">
          <div className="flex items-center justify-between">
            <div>
              <Typography variant="h6" color="white">
                🏃 Activities Management (Admin)
              </Typography>
              <Typography variant="small" color="white" className="opacity-80">
                Total: {activities.length} activities
              </Typography>
            </div>
            <Button
              size="sm"
              color="white"
              className="flex items-center gap-2"
              onClick={() => handleOpenDialog()}
            >
              <PlusIcon className="h-4 w-4" />
              Add Activity
            </Button>
          </div>
        </CardHeader>
        <CardBody>
          <div className="mb-6">
            <Input
              label="Search activities..."
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
                      Name
                    </Typography>
                  </th>
                  <th className="border-b border-blue-gray-100 bg-blue-gray-50 p-4">
                    <Typography variant="small" color="blue-gray" className="font-bold leading-none">
                      Difficulty
                    </Typography>
                  </th>
                  <th className="border-b border-blue-gray-100 bg-blue-gray-50 p-4">
                    <Typography variant="small" color="blue-gray" className="font-bold leading-none">
                      Duration
                    </Typography>
                  </th>
                  <th className="border-b border-blue-gray-100 bg-blue-gray-50 p-4">
                    <Typography variant="small" color="blue-gray" className="font-bold leading-none">
                      Price
                    </Typography>
                  </th>
                  <th className="border-b border-blue-gray-100 bg-blue-gray-50 p-4">
                    <Typography variant="small" color="blue-gray" className="font-bold leading-none">
                      Zone
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
                {filteredActivities.map((activity, index) => {
                  const isLast = index === filteredActivities.length - 1;
                  const classes = isLast ? "p-4" : "p-4 border-b border-blue-gray-50";

                  return (
                    <tr key={activity.uri}>
                      <td className={classes}>
                        <Typography variant="small" color="blue-gray" className="font-bold">
                          {activity.nom}
                        </Typography>
                      </td>
                      <td className={classes}>
                        <Chip
                          value={activity.difficulte}
                          color={getDifficultyColor(activity.difficulte)}
                          size="sm"
                        />
                      </td>
                      <td className={classes}>
                        <div className="flex items-center gap-2">
                          <ClockIcon className="h-4 w-4 text-gray-600" />
                          <Typography variant="small" color="blue-gray">
                            {activity.duree_heures}h
                          </Typography>
                        </div>
                      </td>
                      <td className={classes}>
                        <div className="flex items-center gap-2">
                          <CurrencyDollarIcon className="h-4 w-4 text-gray-600" />
                          <Typography variant="small" color="blue-gray">
                            ${activity.prix}
                          </Typography>
                        </div>
                      </td>
                      <td className={classes}>
                        {activity.est_dans_zone ? (
                          <div className="flex items-center gap-2">
                            <MapPinIcon className="h-4 w-4 text-gray-600" />
                            <Typography variant="small" color="blue-gray">
                              {getZoneName(activity.est_dans_zone)}
                            </Typography>
                          </div>
                        ) : (
                          <Typography variant="small" color="gray">
                            No zone
                          </Typography>
                        )}
                      </td>
                      <td className={classes}>
                        <div className="flex gap-2">
                          <IconButton
                            size="sm"
                            color="blue"
                            variant="text"
                            onClick={() => handleOpenDialog(activity)}
                          >
                            <PencilIcon className="h-4 w-4" />
                          </IconButton>
                          <IconButton
                            size="sm"
                            color="red"
                            variant="text"
                            onClick={() => handleDelete(activity.uri)}
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

          {filteredActivities.length === 0 && !loading && (
            <div className="text-center py-12">
              <SparklesIcon className="h-16 w-16 mx-auto mb-4 text-gray-400" />
              <Typography variant="h6" color="gray" className="mb-2">
                {searchTerm ? 'No activities match your search' : 'No activities yet'}
              </Typography>
              <Typography variant="small" color="gray">
                {searchTerm ? 'Try adjusting your search terms' : 'Click "Add Activity" to create your first activity'}
              </Typography>
            </div>
          )}
        </CardBody>
      </Card>

      {/* Add/Edit Dialog */}
      <Dialog open={openDialog} handler={handleCloseDialog} size="md">
        <DialogHeader>
          {editMode ? 'Edit Activity' : 'Add New Activity'}
        </DialogHeader>
        <form onSubmit={handleSubmit} noValidate>
          <DialogBody divider className="space-y-4 max-h-[60vh] overflow-y-auto">
            <div>
              <Input
                label="Activity Name *"
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
              label="Difficulty *"
              value={formData.difficulte}
              onChange={(value) => setFormData({ ...formData, difficulte: value })}
            >
              <Option value="Facile">🟢 Easy (Facile)</Option>
              <Option value="Moyenne">🟡 Medium (Moyenne)</Option>
              <Option value="Difficile">🔴 Difficult (Difficile)</Option>
            </Select>

            <div>
              <Input
                type="number"
                step="0.5"
                label="Duration (hours) * (Max: 1 week)"
                value={formData.duree_heures}
                onChange={(e) => handleFieldChange('duree_heures', e.target.value)}
                error={!!errors.duree_heures}
              />
              {errors.duree_heures && (
                <Typography variant="small" color="red" className="mt-1 flex items-center gap-1">
                  <ExclamationCircleIcon className="h-4 w-4" />
                  {errors.duree_heures}
                </Typography>
              )}
            </div>

            <div>
              <Input
                type="number"
                step="0.01"
                label="Price ($) * (Max: $10,000)"
                value={formData.prix}
                onChange={(e) => handleFieldChange('prix', e.target.value)}
                error={!!errors.prix}
              />
              {errors.prix && (
                <Typography variant="small" color="red" className="mt-1 flex items-center gap-1">
                  <ExclamationCircleIcon className="h-4 w-4" />
                  {errors.prix}
                </Typography>
              )}
            </div>

            <Select
              label="Natural Zone (Optional)"
              value={formData.est_dans_zone || ""}
              onChange={(value) => setFormData({ ...formData, est_dans_zone: value === "" ? "" : value })}
            >
              <Option value="">None</Option>
              {zones.map((zone) => (
                <Option key={zone.uri} value={zone.uri}>
                  {zone.nom} ({zone.type})
                </Option>
              ))}
            </Select>
            {formData.est_dans_zone && formData.est_dans_zone !== "" && (
              <Typography variant="small" color="blue-gray" className="mt-1">
                Selected: {zones.find(z => z.uri === formData.est_dans_zone)?.nom || 'Unknown Zone'}
              </Typography>
            )}
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
            <Button type="submit" variant="gradient" color="blue">
              {editMode ? 'Update' : 'Create'}
            </Button>
          </DialogFooter>
        </form>
      </Dialog>
    </div>
  );
}

export default ActivitiesAdmin;
