import { useState } from "react";
import { useNavigate } from "react-router-dom";

import { apiFetch } from "../../api/apiFetch";

import "../../styles/forms.css";

function CreateSubAdmin() {
  const navigate = useNavigate();

  // =====================================
  // FORM DATA
  // =====================================

  const [formData, setFormData] = useState({
    name: "",
    subAdminId: "",
    mobile: "",
    email: "",
    password: "",
  });

  // =====================================
  // STATES
  // =====================================

  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  // =====================================
  // INPUT CHANGE
  // =====================================

  const handleChange = (event) => {
    const { name, value } = event.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    setMessage("");
    setError("");
  };

  // =====================================
  // CREATE SUB ADMIN
  // JWT automatically sent by apiFetch
  // =====================================

  const handleSubmit = async (event) => {
    event.preventDefault();

    setMessage("");
    setError("");

    // ===================================
    // VALIDATION
    // ===================================

    if (
      !formData.name.trim() ||
      !formData.subAdminId.trim() ||
      !formData.mobile.trim() ||
      !formData.email.trim() ||
      !formData.password
    ) {
      setError("कृपया सर्व माहिती भरा.");
      return;
    }

    // MOBILE VALIDATION

    if (!/^[0-9]{10}$/.test(formData.mobile)) {
      setError(
        "Mobile Number 10 अंकी असावा."
      );
      return;
    }

    // PASSWORD VALIDATION

    if (formData.password.length < 6) {
      setError(
        "Password कमीत कमी 6 characters असावा."
      );
      return;
    }

    setLoading(true);

    try {
      // =================================
      // BACKEND API
      // =================================

      const response = await apiFetch(
        "/api/users/sub-admins",
        {
          method: "POST",

          headers: {
            "Content-Type":
              "application/json",
          },

          body: JSON.stringify({
            name:
              formData.name.trim(),

            subAdminId:
              formData.subAdminId
                .trim()
                .toUpperCase(),

            mobile:
              formData.mobile.trim(),

            email:
              formData.email
                .trim()
                .toLowerCase(),

            password:
              formData.password,
          }),
        }
      );

      // =================================
      // BACKEND ERROR
      // =================================

      if (!response.ok) {
        const errorMessage =
          await response.text();

        throw new Error(
          errorMessage ||
            "Sub Admin तयार करता आला नाही."
        );
      }

      // =================================
      // SUCCESS RESPONSE
      // =================================

      const data =
        await response.json();

      setMessage(
        data.message ||
          "Sub Admin यशस्वीरीत्या तयार झाला."
      );

      // =================================
      // CLEAR FORM
      // =================================

      setFormData({
        name: "",
        subAdminId: "",
        mobile: "",
        email: "",
        password: "",
      });
    } catch (err) {
      console.error(
        "Create Sub Admin Error:",
        err
      );

      if (
        err.message ===
        "Failed to fetch"
      ) {
        setError(
          "Backend server connect होत नाही."
        );
      } else {
        setError(
          err.message ||
            "Sub Admin तयार करता आला नाही."
        );
      }
    } finally {
      setLoading(false);
    }
  };

  // =====================================
  // PAGE
  // =====================================

  return (
    <div className="create-subadmin-page">

      <div className="create-subadmin-container">

        {/* =============================
            BACK BUTTON
        ============================= */}

        <button
          type="button"
          className="subadmin-back-btn"
          onClick={() =>
            navigate(
              "/main-admin/dashboard"
            )
          }
        >
          ← BACK TO DASHBOARD
        </button>

        {/* =============================
            HEADING
        ============================= */}

        <div className="create-subadmin-heading">

          <div className="subadmin-heading-icon">
            🏢
          </div>

          <div>

            <span>
              MAIN ADMIN MANAGEMENT
            </span>

            <h1>
              CREATE SUB ADMIN
            </h1>

            <p>
              नवीन Sub Admin account तयार करा
            </p>

          </div>

        </div>

        {/* =============================
            FORM
        ============================= */}

        <form
          className="create-subadmin-form"
          onSubmit={handleSubmit}
        >

          {/* ===========================
              SUB ADMIN NAME
          =========================== */}

          <div className="subadmin-form-group">

            <label>
              SUB ADMIN NAME
            </label>

            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              placeholder="Ex: Rahul Patil"
              required
            />

          </div>

          {/* ===========================
              SUB ADMIN ID
          =========================== */}

          <div className="subadmin-form-group">

            <label>
              SUB ADMIN ID
            </label>

            <input
              type="text"
              name="subAdminId"
              value={formData.subAdminId}
              onChange={handleChange}
              placeholder="Ex: SUBADMIN-001"
              required
            />

          </div>

          {/* ===========================
              MOBILE NUMBER
          =========================== */}

          <div className="subadmin-form-group">

            <label>
              MOBILE NUMBER
            </label>

            <input
              type="tel"
              name="mobile"
              maxLength="10"
              value={formData.mobile}
              onChange={handleChange}
              placeholder="10-digit number"
              required
            />

          </div>

          {/* ===========================
              EMAIL ADDRESS
          =========================== */}

          <div className="subadmin-form-group">

            <label>
              EMAIL ADDRESS
            </label>

            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="subadmin@example.com"
              required
            />

          </div>

          {/* ===========================
              LOGIN PASSWORD
          =========================== */}

          <div className="subadmin-form-group">

            <label>
              LOGIN PASSWORD
            </label>

            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              placeholder="Minimum 6 characters"
              required
            />

          </div>

          {/* ===========================
              ERROR MESSAGE
          =========================== */}

          {error && (
            <div className="subadmin-form-error">
              {error}
            </div>
          )}

          {/* ===========================
              SUCCESS MESSAGE
          =========================== */}

          {message && (
            <div className="subadmin-form-success">
              ✓ {message}
            </div>
          )}

          {/* ===========================
              CREATE BUTTON
          =========================== */}

          <button
            type="submit"
            className="create-subadmin-submit"
            disabled={loading}
          >
            {loading
              ? "CREATING..."
              : "CREATE SUB ADMIN"}
          </button>

        </form>

      </div>

    </div>
  );
}

export default CreateSubAdmin;