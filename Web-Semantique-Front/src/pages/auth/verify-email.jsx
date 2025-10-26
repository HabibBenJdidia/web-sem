import { useState, useEffect } from "react";
import {
  Button,
  Typography,
  Alert,
  Spinner,
} from "@material-tailwind/react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import api from "@/services/api";

export function VerifyEmail() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  const [email, setEmail] = useState("");

  useEffect(() => {
    if (token) {
      verifyEmail();
    } else {
      setError("Token manquant. Veuillez utiliser le lien envoyé par email.");
      setLoading(false);
    }
  }, [token]);

  const verifyEmail = async () => {
    try {
      const response = await api.fetch('/auth/verify-email', {
        method: 'POST',
        body: JSON.stringify({ token }),
      });
      
      setSuccess(true);
      setEmail(response.email);
      setLoading(false);

      // Redirect to sign-in after 5 seconds
      setTimeout(() => {
        navigate("/auth/sign-in");
      }, 5000);
    } catch (err) {
      setError(err.message || "La vérification a échoué. Le lien a peut-être expiré.");
      setLoading(false);
    }
  };

  const handleResend = async () => {
    if (!email) {
      setError("Email manquant");
      return;
    }

    try {
      await api.fetch('/auth/resend-verification', {
        method: 'POST',
        body: JSON.stringify({ email }),
      });
      
      alert("Email de vérification renvoyé! Vérifiez votre boîte de réception.");
    } catch (err) {
      alert("Erreur lors de l'envoi: " + err.message);
    }
  };

  return (
    <section className="m-8 flex items-center justify-center min-h-screen">
      <div className="w-full max-w-2xl">
        <div className="text-center mb-8">
          <Typography variant="h2" className="font-bold mb-4">
            Vérification de l'email
          </Typography>
        </div>

        {loading && (
          <div className="flex flex-col items-center justify-center p-12">
            <Spinner className="h-12 w-12" color="blue" />
            <Typography variant="h6" className="mt-4">
              Vérification en cours...
            </Typography>
            <Typography variant="small" color="gray" className="mt-2">
              Veuillez patienter pendant que nous vérifions votre email.
            </Typography>
          </div>
        )}

        {!loading && error && (
          <Alert color="red" className="mb-6">
            <div>
              <Typography variant="h6" className="mb-2">
                ❌ Vérification échouée
              </Typography>
              <Typography variant="small">
                {error}
              </Typography>
              <div className="mt-4 flex gap-2">
                <Link to="/auth/sign-in">
                  <Button size="sm" variant="outlined" color="red">
                    Retour à la connexion
                  </Button>
                </Link>
                {email && (
                  <Button size="sm" variant="filled" color="red" onClick={handleResend}>
                    Renvoyer l'email
                  </Button>
                )}
              </div>
            </div>
          </Alert>
        )}

        {!loading && success && (
          <Alert color="green" className="mb-6">
            <div className="text-center">
              <div className="mb-4 flex justify-center">
                <div className="rounded-full bg-green-100 p-4">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-16 w-16 text-green-600"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                </div>
              </div>

              <Typography variant="h4" className="mb-2 text-green-800">
                ✓ Email vérifié avec succès!
              </Typography>
              
              <Typography variant="paragraph" className="mb-4 text-green-700">
                Votre adresse email <strong>{email}</strong> a été vérifiée.
              </Typography>

              <Typography variant="small" className="mb-6 text-green-600">
                Vous allez être redirigé vers la page de connexion dans quelques secondes...
              </Typography>

              <div className="flex justify-center gap-4 mt-6">
                <Link to="/auth/sign-in">
                  <Button color="green" size="lg">
                    Se connecter maintenant
                  </Button>
                </Link>
              </div>
            </div>
          </Alert>
        )}

        <div className="mt-8 text-center">
          <Typography variant="small" color="gray">
            © 2025 Travel-Tourism - Plateforme d'Écotourisme
          </Typography>
        </div>
      </div>
    </section>
  );
}

export default VerifyEmail;

