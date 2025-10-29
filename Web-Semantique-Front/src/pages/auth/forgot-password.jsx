import { useState } from "react";
import {
  Card,
  Input,
  Button,
  Typography,
  Alert,
} from "@material-tailwind/react";
import { Link } from "react-router-dom";
import api from "@/services/api";

export function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setSuccess(false);
    setLoading(true);

    // Validation
    if (!email) {
      setError("Please enter your email address");
      setLoading(false);
      return;
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setError("Please enter a valid email address");
      setLoading(false);
      return;
    }

    try {
      await api.fetch('/auth/forgot-password', {
        method: 'POST',
        body: JSON.stringify({ email }),
      });
      
      setSuccess(true);
    } catch (err) {
      setError(err.message || "Failed to send reset email. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="m-8 flex gap-4">
      <div className="w-full lg:w-3/5 mt-24">
        <div className="text-center">
          <Typography variant="h2" className="font-bold mb-4">
            Mot de passe oublié?
          </Typography>
          <Typography variant="paragraph" color="blue-gray" className="text-lg font-normal">
            Entrez votre adresse email et nous vous enverrons un lien pour réinitialiser votre mot de passe.
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
                Email envoyé avec succès! ✉️
              </Typography>
              <Typography variant="small">
                Vérifiez votre boîte de réception. Si vous ne recevez pas l'email dans quelques minutes, 
                vérifiez votre dossier spam.
              </Typography>
            </div>
          </Alert>
        )}

        <form onSubmit={handleSubmit} className="mt-8 mb-2 mx-auto w-80 max-w-screen-lg lg:w-1/2">
          <div className="mb-6 flex flex-col gap-6">
            <div>
              <Typography variant="small" color="blue-gray" className="mb-2 font-medium">
                Votre email
              </Typography>
              <Input
                size="lg"
                type="email"
                placeholder="nom@exemple.com"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  setError(null);
                }}
                disabled={loading || success}
                className="!border-t-blue-gray-200 focus:!border-t-gray-900"
                labelProps={{
                  className: "before:content-none after:content-none",
                }}
              />
            </div>
          </div>

          <Button 
            className="mt-6" 
            fullWidth 
            type="submit"
            disabled={loading || success}
          >
            {loading ? "Envoi en cours..." : "Envoyer le lien de réinitialisation"}
          </Button>

          <div className="mt-6 flex items-center justify-center gap-2">
            <Typography variant="small" color="gray">
              Vous vous souvenez de votre mot de passe?
            </Typography>
            <Link to="/auth/sign-in">
              <Typography variant="small" className="font-medium text-gray-900 hover:underline">
                Se connecter
              </Typography>
            </Link>
          </div>

          <div className="mt-2 flex items-center justify-center gap-2">
            <Typography variant="small" color="gray">
              Pas encore inscrit?
            </Typography>
            <Link to="/auth/sign-up">
              <Typography variant="small" className="font-medium text-gray-900 hover:underline">
                Créer un compte
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

export default ForgotPassword;

