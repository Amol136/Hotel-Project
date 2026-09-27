import { useState } from "react";
import { useNavigate } from "react-router-dom";

import { useAuth } from "../../auth/useAuth";
import { apiFetch } from "../../api/apiFetch";

import "../../styles/forms.css";

function CreateManager() {
  const navigate = useNavigate();
  const { user } = useAuth();

  // =====================================
  // FORM DATA
  // =====================================

  const [formData, setFormData] = useState({
    managerName: "",
    managerId: "",
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

    setFormData((previous) => ({
      ...previous,
      [name]: value,
    }));

    setError("");
    setMessage("");
  };

  // =====================================
  // CREATE MANAGER
  // =====================================

  const handleSubmit = async (event) => {
    event.preventDefault();

    // -------------------------------------
    // LOGGED-IN SUB ADMIN CHECK
    // -------------------------------------

    if (
      !user ||
      user.role !== "SUB_ADMIN" ||
      !user.id
    ) {
      setError(
        "Sub Admin login माहिती मिळाली नाही. कृपया पुन्हा login करा."
      );

      return;
    }

    // -------------------------------------
    // REQUIRED FIELDS
    // -------------------------------------

    if (
      !formData.managerName.trim() ||
      !formData.managerId.trim() ||
      !formData.mobile.trim() ||
      !formData.email.trim() ||
      !formData.password
    ) {
      setError("कृपया सर्व माहिती भरा.");

      return;
    }

    // -------------------------------------
    // MOBILE VALIDATION
    // -------------------------------------

    if (!/^[0-9]{10}$/.test(formData.mobile)) {
      setError(
        "Mobile Number 10 अंकी असावा."
      );

      return;
    }

    // -------------------------------------
    // PASSWORD VALIDATION
    // -------------------------------------

    if (formData.password.length < 6) {
      setError(
        "Password कमीत कमी 6 characters असावा."
      );

      return;
    }

    try {
      setLoading(true);
      setError("");
      setMessage("");

      // =====================================
      // BACKEND API
      // apiFetch automatically sends JWT
      // =====================================

      const response = await apiFetch(
        "/api/users/managers",
        {
          method: "POST",

          headers: {
            "Content-Type": "application/json",
          },

          body: JSON.stringify({
            managerName:
              formData.managerName.trim(),

            managerId:
              formData.managerId
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

            // Logged-in Sub Admin
            // PostgreSQL database ID
            createdBySubAdminId: user.id,
          }),
        }
      );

      // =====================================
      // BACKEND ERROR
      // =====================================

      if (!response.ok) {
        const errorMessage =
          await response.text();

        throw new Error(
          errorMessage ||
            "Manager तयार करता आला नाही."
        );
      }

      // =====================================
      // SUCCESS RESPONSE
      // =====================================

      const data = await response.json();

      setMessage(
        `Manager ${
          data.managerName ||
          formData.managerName
        } यशस्वीरीत्या तयार झाला.`
      );

      // =====================================
      // CLEAR FORM
      // =====================================

      setFormData({
        managerName: "",
        managerId: "",
        mobile: "",
        email: "",
        password: "",
      });
    } catch (err) {
      console.error(
        "Create Manager Error:",
        err
      );

      if (err.message === "Failed to fetch") {
        setError(
          "Backend server connect होत नाही."
        );
      } else {
        setError(
          err.message ||
            "Manager तयार करताना error आला."
        );
      }
    } finally {
      setLoading(false);
    }
  };

  // =====================================
  // UI
  // =====================================

  return (
    <div className="create-manager-page">

      <div className="create-manager-container">

        {/* =================================
            BACK BUTTON
        ================================= */}

        <button
          type="button"
          className="manager-back-button"
          onClick={() =>
            navigate("/sub-admin/dashboard")
          }
        >
          ← BACK TO DASHBOARD
        </button>

        {/* =================================
            HEADING
        ================================= */}

        <div className="create-manager-heading">

          <div className="manager-heading-icon">
            👤
          </div>

          <div>

            <span>
              SUB ADMIN MANAGEMENT
            </span>

            <h1>
              CREATE MANAGER
            </h1>

            <p>
              नवीन Manager account तयार करा
            </p>

          </div>

        </div>

        {/* =================================
            CREATED UNDER
        ================================= */}

        <div className="manager-created-by">

          <small>
            MANAGER WILL BE CREATED UNDER
          </small>

          <strong>
            {user?.name || "Sub Admin"}
          </strong>

          <span>
            {user?.subAdminId ||
              user?.userId ||
              ""}
          </span>

        </div>

        {/* =================================
            FORM
        ================================= */}

        <form
          className="create-manager-form"
          onSubmit={handleSubmit}
        >

          {/* MANAGER NAME */}

          <div className="manager-form-group">

            <label>
              MANAGER NAME
            </label>

            <input
              type="text"
              name="managerName"
              value={formData.managerName}
              onChange={handleChange}
              placeholder="Ex: Sangam"
              autoComplete="off"
            />

          </div>

          {/* MANAGER ID */}

          <div className="manager-form-group">

            <label>
              MANAGER ID
            </label>

            <input
              type="text"
              name="managerId"
              value={formData.managerId}
              onChange={handleChange}
              placeholder="Ex: MGR-002"
              autoComplete="off"
            />

          </div>

          {/* MOBILE NUMBER */}

          <div className="manager-two-column">

            <div className="manager-form-group">

              <label>
                MOBILE NUMBER
              </label>

              <input
                type="tel"
                name="mobile"
                value={formData.mobile}
                onChange={handleChange}
                placeholder="10-digit number"
                maxLength="10"
                inputMode="numeric"
                autoComplete="off"
              />

            </div>

          </div>

          {/* EMAIL */}

          <div className="manager-form-group">

            <label>
              EMAIL ADDRESS
            </label>

            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="manager@example.com"
              autoComplete="off"
            />

          </div>

          {/* PASSWORD */}

          <div className="manager-form-group">

            <label>
              LOGIN PASSWORD
            </label>

            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              placeholder="Minimum 6 characters"
              autoComplete="new-password"
            />

          </div>

          {/* ERROR */}

          {error && (
            <div className="manager-form-error">
              {error}
            </div>
          )}

          {/* SUCCESS */}

          {message && (
            <div className="manager-form-success">
              ✓ {message}
            </div>
          )}

          {/* SUBMIT */}

          <button
            type="submit"
            className="create-manager-submit"
            disabled={loading}
          >
            {loading
              ? "CREATING..."
              : "CREATE MANAGER"}
          </button>

        </form>

      </div>

    </div>
  );
}

export default CreateManager;