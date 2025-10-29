import React from 'react';
import { 
  Button, 
  IconButton, 
  Tooltip,
  Typography,
  Spinner
} from "@material-tailwind/react";
import { PencilIcon, TrashIcon } from '@heroicons/react/24/outline';

export const DataGrid = ({ 
  columns, 
  data, 
  onEdit, 
  onDelete,
  loading = false
}) => {
  if (loading) {
    return (
      <div className="flex justify-center items-center py-12">
        <Spinner className="h-8 w-8" />
      </div>
    );
  }

  if (data.length === 0) {
    return (
      <div className="text-center py-8">
        <Typography variant="small" className="text-gray-600">
          Aucune donnée disponible
        </Typography>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-max table-auto text-left">
        <thead>
          <tr>
            {columns.map((column) => (
              <th 
                key={column.key} 
                className="border-b border-blue-gray-100 bg-blue-gray-50/50 p-4"
              >
                <Typography
                  variant="small"
                  color="blue-gray"
                  className="font-semibold leading-none opacity-70"
                >
                  {column.header}
                </Typography>
              </th>
            ))}
            {(onEdit || onDelete) && (
              <th className="border-b border-blue-gray-100 bg-blue-gray-50/50 p-4 w-24">
                <Typography
                  variant="small"
                  color="blue-gray"
                  className="font-semibold leading-none opacity-70"
                >
                  Actions
                </Typography>
              </th>
            )}
          </tr>
        </thead>
        <tbody>
          {data.map((row, rowIndex) => (
            <tr key={rowIndex} className="hover:bg-blue-gray-50/50">
              {columns.map((column) => (
                <td 
                  key={column.key} 
                  className="p-4 border-b border-blue-gray-100"
                >
                  <Typography
                    variant="small"
                    color="blue-gray"
                    className="font-normal"
                  >
                    {row[column.key] || '-'}
                  </Typography>
                </td>
              ))}
              {(onEdit || onDelete) && (
                <td className="p-4 border-b border-blue-gray-100">
                  <div className="flex items-center gap-2">
                    {onEdit && (
                      <Tooltip content="Modifier">
                        <IconButton
                          variant="text"
                          color="blue-gray"
                          onClick={() => onEdit(row)}
                          size="sm"
                        >
                          <PencilIcon className="h-4 w-4" />
                        </IconButton>
                      </Tooltip>
                    )}
                    {onDelete && (
                      <Tooltip content="Supprimer">
                        <IconButton
                          variant="text"
                          color="red"
                          onClick={() => onDelete(row)}
                          size="sm"
                        >
                          <TrashIcon className="h-4 w-4" />
                        </IconButton>
                      </Tooltip>
                    )}
                  </div>
                </td>
              )}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default DataGrid;
