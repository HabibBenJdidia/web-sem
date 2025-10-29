import { useState, useEffect } from "react";
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
  IconButton,
  Chip,
  Switch,
} from "@material-tailwind/react";
import { PencilIcon, TrashIcon, PlusIcon } from "@heroicons/react/24/solid";
import api from "@/services/api";

export function Produits() {
  const [produits, setProduits] = useState([]);
  const [loading, setLoading] = useState(true);
  const [openDialog, setOpenDialog] = useState(false);
  const [editingProduit, setEditingProduit] = useState(null);
  const [formData, setFormData] = useState({
    nom: "",
    saison: "",
    bio: false,
  });

  const saisons = ["Printemps", "Été", "Automne", "Hiver", "Toute l'année"];

  useEffect(() => {
    loadProduits();
  }, []);

  const loadProduits = async () => {
    try {
      setLoading(true);
      const data = await api.getProduits();
      setProduits(parseProduits(data));
    } catch (error) {
      console.error("Error loading products:", error);
    } finally {
      setLoading(false);
    }
  };

  const parseProduits = (data) => {
    if (!Array.isArray(data)) return [];
    
    const produitsMap = {};
    data.forEach((item) => {
      const uri = item.s?.value || "";
      const predicate = item.p?.value || "";
      const object = item.o?.value || "";

      if (!produitsMap[uri]) {
        produitsMap[uri] = { uri, bio: false };
      }

      if (predicate.includes("#nom")) {
        produitsMap[uri].nom = object;
      } else if (predicate.includes("#saison")) {
        produitsMap[uri].saison = object;
      } else if (predicate.includes("#bio")) {
        produitsMap[uri].bio = object === "true" || object === true;
      }
    });

    return Object.values(produitsMap).filter(p => p.nom);
  };

  const handleOpenDialog = (produit = null) => {
    if (produit) {
      setEditingProduit(produit);
      setFormData({
        nom: produit.nom || "",
        saison: produit.saison || "",
        bio: produit.bio || false,
      });
    } else {
      setEditingProduit(null);
      setFormData({
        nom: "",
        saison: "",
        bio: false,
      });
    }
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setEditingProduit(null);
    setFormData({
      nom: "",
      saison: "",
      bio: false,
    });
  };

  const handleSubmit = async () => {
    try {
      if (editingProduit) {
        await api.updateProduit(editingProduit.uri, formData);
      } else {
        await api.createProduit(formData);
      }
      await loadProduits();
      handleCloseDialog();
    } catch (error) {
      console.error("Error saving product:", error);
      alert("Failed to save product");
    }
  };

  const handleDelete = async (uri) => {
    if (window.confirm("Are you sure you want to delete this product?")) {
      try {
        await api.deleteProduit(uri);
        await loadProduits();
      } catch (error) {
        console.error("Error deleting product:", error);
        alert("Failed to delete product");
      }
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <Typography variant="h6">Loading products...</Typography>
      </div>
    );
  }

  return (
    <div className="mt-12 mb-8 flex flex-col gap-12">
      <Card>
        <CardHeader variant="gradient" color="orange" className="mb-8 p-6">
          <div className="flex items-center justify-between">
            <Typography variant="h6" color="white">
              Local Products Management
            </Typography>
            <Button
              color="white"
              size="sm"
              className="flex items-center gap-2"
              onClick={() => handleOpenDialog()}
            >
              <PlusIcon className="h-4 w-4" />
              Add Product
            </Button>
          </div>
        </CardHeader>
        <CardBody className="overflow-x-scroll px-0 pt-0 pb-2">
          <table className="w-full min-w-[640px] table-auto">
            <thead>
              <tr>
                {["Product Name", "Season", "Organic", "Actions"].map((el) => (
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
              {produits.length === 0 ? (
                <tr>
                  <td colSpan={4} className="py-3 px-5 text-center">
                    <Typography variant="small" color="blue-gray">
                      No products found. Add your first local product!
                    </Typography>
                  </td>
                </tr>
              ) : (
                produits.map((produit) => (
                  <tr key={produit.uri}>
                    <td className="py-3 px-5 border-b border-blue-gray-50">
                      <div className="flex items-center gap-2">
                        <Typography variant="small" color="blue-gray" className="font-semibold">
                          {produit.nom}
                        </Typography>
                        {produit.bio && (
                          <Chip
                            value="BIO"
                            size="sm"
                            color="green"
                            className="text-xs"
                          />
                        )}
                      </div>
                    </td>
                    <td className="py-3 px-5 border-b border-blue-gray-50">
                      <Chip
                        value={produit.saison || "N/A"}
                        size="sm"
                        color="blue"
                        variant="ghost"
                        className="text-xs"
                      />
                    </td>
                    <td className="py-3 px-5 border-b border-blue-gray-50">
                      {produit.bio ? (
                        <Chip value="Yes" color="green" size="sm" />
                      ) : (
                        <Chip value="No" color="gray" size="sm" />
                      )}
                    </td>
                    <td className="py-3 px-5 border-b border-blue-gray-50">
                      <div className="flex gap-2">
                        <IconButton
                          variant="text"
                          color="blue"
                          onClick={() => handleOpenDialog(produit)}
                        >
                          <PencilIcon className="h-4 w-4" />
                        </IconButton>
                        <IconButton
                          variant="text"
                          color="red"
                          onClick={() => handleDelete(produit.uri)}
                        >
                          <TrashIcon className="h-4 w-4" />
                        </IconButton>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </CardBody>
      </Card>

      {/* Add/Edit Dialog */}
      <Dialog open={openDialog} handler={handleCloseDialog} size="sm">
        <DialogHeader>
          {editingProduit ? "Edit Product" : "Add New Local Product"}
        </DialogHeader>
        <DialogBody divider>
          <div className="flex flex-col gap-4">
            <Input
              label="Product Name"
              value={formData.nom}
              onChange={(e) => setFormData({ ...formData, nom: e.target.value })}
              required
            />

            <Select
              label="Season"
              value={formData.saison}
              onChange={(value) => setFormData({ ...formData, saison: value })}
            >
              {saisons.map((saison) => (
                <Option key={saison} value={saison}>
                  {saison}
                </Option>
              ))}
            </Select>

            <div className="flex items-center justify-between">
              <Typography variant="small" color="blue-gray" className="font-medium">
                Organic Product (Bio)
              </Typography>
              <Switch
                checked={formData.bio}
                onChange={(e) => setFormData({ ...formData, bio: e.target.checked })}
                color="green"
              />
            </div>
          </div>
        </DialogBody>
        <DialogFooter>
          <Button variant="text" color="red" onClick={handleCloseDialog} className="mr-2">
            Cancel
          </Button>
          <Button variant="gradient" color="orange" onClick={handleSubmit}>
            {editingProduit ? "Update" : "Create"}
          </Button>
        </DialogFooter>
      </Dialog>
    </div>
  );
}

export default Produits;


