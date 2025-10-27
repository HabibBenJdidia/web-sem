import React, { useState, useEffect } from 'react';
import { 
  Button, 
  Input, 
  Textarea, 
  Typography, 
  Select, 
  Option,
  Card,
  CardBody,
  CardFooter
} from "@material-tailwind/react";

export const EnergieForm = ({ energie, onSave, onCancel }) => {
  const [formData, setFormData] = useState({
    nom: '',
    type: 'solaire',
    description: '',
    capacite: '',
    localisation: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const typesEnergie = [
    { value: 'solaire', label: 'Solaire' },
    { value: 'eolien', label: 'Éolien' },
    { value: 'hydraulique', label: 'Hydraulique' },
    { value: 'biomasse', label: 'Biomasse' },
    { value: 'geothermie', label: 'Géothermie' },
    { value: 'autre', label: 'Autre' }
  ];

  useEffect(() => {
    if (energie) {
      setFormData({
        nom: energie.nom || '',
        type: energie.type || 'solaire',
        description: energie.description || '',
        capacite: energie.capacite || '',
        localisation: energie.localisation || ''
      });
    }
  }, [energie]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSelectChange = (value, name) => {
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await onSave(formData);
    } catch (error) {
      console.error('Erreur lors de la sauvegarde:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <Card className="shadow-none">
        <CardBody className="p-0 pb-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <Typography 
                variant="small" 
                color="blue-gray" 
                className="mb-2 font-medium"
              >
                Nom *
              </Typography>
              <Input
                name="nom"
                value={formData.nom}
                onChange={handleChange}
                required
                placeholder="Nom de l'énergie"
                className="!border-t-blue-gray-200 focus:!border-t-gray-900"
                labelProps={{
                  className: "before:content-none after:content-none",
                }}
              />
            </div>
            
            <div>
              <Typography 
                variant="small" 
                color="blue-gray" 
                className="mb-2 font-medium"
              >
                Type d'énergie *
              </Typography>
              <Select
                name="type"
                value={formData.type}
                onChange={(value) => handleSelectChange(value, 'type')}
                label="Sélectionner un type"
                className="!border-t-blue-gray-200 focus:!border-t-gray-900"
                labelProps={{
                  className: "before:content-none after:content-none",
                }}
              >
                {typesEnergie.map((type) => (
                  <Option key={type.value} value={type.value}>
                    {type.label}
                  </Option>
                ))}
              </Select>
            </div>
            
            <div>
              <Typography 
                variant="small" 
                color="blue-gray" 
                className="mb-2 font-medium"
              >
                Capacité (MW) *
              </Typography>
              <Input
                type="number"
                name="capacite"
                value={formData.capacite}
                onChange={handleChange}
                required
                placeholder="Ex: 10.5"
                step="0.01"
                min="0"
                className="!border-t-blue-gray-200 focus:!border-t-gray-900"
                labelProps={{
                  className: "before:content-none after:content-none",
                }}
              />
            </div>
            
            <div>
              <Typography 
                variant="small" 
                color="blue-gray" 
                className="mb-2 font-medium"
              >
                Localisation *
              </Typography>
              <Input
                name="localisation"
                value={formData.localisation}
                onChange={handleChange}
                required
                placeholder="Ville, région, pays"
                className="!border-t-blue-gray-200 focus:!border-t-gray-900"
                labelProps={{
                  className: "before:content-none after:content-none",
                }}
              />
            </div>
            
            <div className="md:col-span-2">
              <Typography 
                variant="small" 
                color="blue-gray" 
                className="mb-2 font-medium"
              >
                Description
              </Typography>
              <Textarea
                name="description"
                value={formData.description}
                onChange={handleChange}
                placeholder="Description détaillée de la source d'énergie"
                className="!border-t-blue-gray-200 focus:!border-t-gray-900 min-h-[100px]"
                labelProps={{
                  className: "before:content-none after:content-none",
                }}
              />
            </div>
          </div>
        </CardBody>
        
        <CardFooter className="flex items-center justify-end gap-2 pt-4 border-t border-blue-gray-50">
          <Button 
            variant="text" 
            color="gray" 
            onClick={onCancel}
            type="button"
            size="sm"
            className="px-4"
          >
            Annuler
          </Button>
          <Button 
            type="submit" 
            color="blue"
            size="sm"
            className="flex items-center gap-2 px-6"
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <>
                <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Enregistrement...
              </>
            ) : (
              <>{energie?.uri ? 'Mettre à jour' : 'Créer'}</>
            )}
          </Button>
        </CardFooter>
      </Card>
    </form>
  );
};

export default EnergieForm;
