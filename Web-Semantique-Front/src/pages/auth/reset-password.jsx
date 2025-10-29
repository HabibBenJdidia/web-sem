import { useState, useEffect } from "react";
import {
  Card,
  Input,
  Button,
  Typography,
  Alert,
} from "@material-tailwind/react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import api from "@/services/api";

export function ResetPassword() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');

  const [formData, setFormData] = useState({
    password: "",
    confirmPassword: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  const [formErrors, setFormErrors] = useState({});

  useEffect(() => {
    if (!token) {
      setError("Token manquant. Veuillez demander un nouveau lien de réinitialisation.");
    }
  }, [token]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
    setFormErrors({
      ...formErrors,
      [name]: null,
    });
    setError(null);
  };

  const validateForm = () => {
    const errors = {};

    if (!formData.password) {
      errors.password = "Le mot de passe est requis";
    } else if (formData.password.length < 6) {
      errors.password = "Le mot de passe doit contenir au moins 6 caractères";
    }

    if (!formData.confirmPassword) {
      errors.confirmPassword = "Veuillez confirmer le mot de passe";
    } else if (formData.password !== formData.confirmPassword) {
      errors.confirmPassword = "Les mots de passe ne correspondent pas";
    }

    return errors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setSuccess(false);
    setFormErrors({});

    if (!token) {
      setError("Token manquant");
      return;
    }

    // Validation
    const errors = validateForm();
    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      return;
    }

    setLoading(true);

    try {
      await api.fetch('/auth/reset-password', {
        method: 'POST',
        body: JSON.stringify({
          token: token,
          password: formData.password,
        }),
      });
      
      setSuccess(true);

      // Redirect to sign-in after 3 seconds
      setTimeout(() => {
        navigate("/auth/sign-in");
      }, 3000);
    } catch (err) {
      setError(err.message || "La réinitialisation a échoué. Le lien a peut-être expiré.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="m-8 flex gap-4">
      <div className="w-full lg:w-3/5 mt-24">
        <div className="text-center">
          <Typography variant="h2" className="font-bold mb-4">
            Réinitialiser le mot de passe
          </Typography>
          <Typography variant="paragraph" color="blue-gray" className="text-lg font-normal">
            Entrez votre nouveau mot de passe ci-dessous.
          </Typography>
        </div>

        {error && (
          <Alert color="red" className="mt-6 mx-auto w-80 max-w-screen-lg lg:w-1/2">
            {error}
          </Alert>
        )}

        {success && (
          <Alert color="green" className="mt-6 mx-auto w-80 max-w-screen-lg lg:w-1/2">
            <div>
              <Typography variant="h6" className="mb-2">
                Mot de passe réinitialisé! ✓
              </Typography>
              <Typography variant="small">
                Votre mot de passe a été modifié avec succès. Redirection vers la page de connexion...
              </Typography>
            </div>
          </Alert>
        )}

        <form onSubmit={handleSubmit} className="mt-8 mb-2 mx-auto w-80 max-w-screen-lg lg:w-1/2">
          <div className="mb-1 flex flex-col gap-6">
            {/* Nouveau mot de passe */}
            <div>
              <Typography variant="small" color="blue-gray" className="mb-2 font-medium">
                Nouveau mot de passe <span className="text-red-500">*</span>
              </Typography>
              <Input
                size="lg"
                type="password"
                name="password"
                placeholder="••••••••"
                value={formData.password}
                onChange={handleChange}
                disabled={loading || success || !token}
                className={`!border-t-blue-gray-200 focus:!border-t-gray-900 ${
                  formErrors.password ? "!border-red-500" : ""
                }`}
                labelProps={{
                  className: "before:content-none after:content-none",
                }}
                error={!!formErrors.password}
              />
              {formErrors.password && (
                <Typography variant="small" color="red" className="mt-1">
                  {formErrors.password}
                </Typography>
              )}
            </div>

            {/* Confirmer le mot de passe */}
            <div>
              <Typography variant="small" color="blue-gray" className="mb-2 font-medium">
                Confirmer le mot de passe <span className="text-red-500">*</span>
              </Typography>
              <Input
                size="lg"
                type="password"
                name="confirmPassword"
                placeholder="••••••••"
                value={formData.confirmPassword}
                onChange={handleChange}
                disabled={loading || success || !token}
                className={`!border-t-blue-gray-200 focus:!border-t-gray-900 ${
                  formErrors.confirmPassword ? "!border-red-500" : ""
                }`}
                labelProps={{
                  className: "before:content-none after:content-none",
                }}
                error={!!formErrors.confirmPassword}
              />
              {formErrors.confirmPassword && (
                <Typography variant="small" color="red" className="mt-1">
                  {formErrors.confirmPassword}
                </Typography>
              )}
            </div>
          </div>

          <Button 
            className="mt-6" 
            fullWidth 
            type="submit"
            disabled={loading || success || !token}
          >
            {loading ? "Réinitialisation..." : "Réinitialiser le mot de passe"}
          </Button>

          <div className="mt-6 flex items-center justify-center gap-2">
            <Typography variant="small" color="gray">
              Retour à la
            </Typography>
            <Link to="/auth/sign-in">
              <Typography variant="small" className="font-medium text-gray-900 hover:underline">
                page de connexion
              </Typography>
            </Link>
          </div>
        </form>
      </div>

      <div className="w-2/5 h-full hidden lg:block">
        <img
          src="/img/pattern.png"
          className="h-full w-full object-cover rounded-3xl"
          alt="Pattern"
        />
      </div>
    </section>
  );
}

export default ResetPassword;

