import React from 'react';
import { Dialog, DialogHeader, DialogBody, DialogFooter, Button } from "@material-tailwind/react";

export const ConfirmationDialog = ({ open, onClose, onConfirm, title, message }) => {
  return (
    <Dialog open={open} handler={onClose}>
      <DialogHeader>{title}</DialogHeader>
      <DialogBody>{message}</DialogBody>
      <DialogFooter>
        <Button 
          variant="text" 
          color="red" 
          onClick={onClose} 
          className="mr-2"
        >
          Annuler
        </Button>
        <Button 
          variant="gradient" 
          color="red" 
          onClick={onConfirm}
        >
          Confirmer
        </Button>
      </DialogFooter>
    </Dialog>
  );
};

export default ConfirmationDialog;
