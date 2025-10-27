import React from 'react';
import { Card, CardBody, Typography } from '@material-tailwind/react';
import { EnergieList } from './components/EnergieList';

export function Energies() {
  return (
    <div className="mt-12 mb-8 flex flex-col gap-12">
      <Card className="border-0 shadow-sm">
        <CardBody className="p-4 md:p-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
            <div>
              <Typography variant="h5" color="blue-gray" className="mb-1">
                Gestion des Énergies Renouvelables
              </Typography>
              <Typography variant="small" className="text-gray-600">
                Gérez les différentes sources d'énergie renouvelable
              </Typography>
            </div>
          </div>
          <EnergieList />
        </CardBody>
      </Card>
    </div>
  );
}

export default Energies;
