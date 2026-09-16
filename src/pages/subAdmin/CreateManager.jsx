import { useState } from "react";
import { useNavigate } from "react-router-dom";
import "../../styles/forms.css";

function CreateManager() {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    managerName: "",
    managerId: "",
    mobile: "",
    email: "",
    password: "",
  });

  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  // Temporary Sub Admin ID
  // Backend login झाल्यावर JWT मधून मिळेल
  const currentSubAdminId = "SUBADMIN-001";

  const handleChange = (event) => {
    const { name, value } = event.target;

    setFormData((previous) => ({
      ...previous,
      [name]: value,
    }));

    setError("");
    setMessage("");
  };

  const handleSubmit = (event) => {
    event.preventDefault();

    if (
      !formData.managerName ||
      !formData.managerId ||
      !formData.mobile ||
      !formData.email ||
      !formData.password
    ) {
      setError("कृपया सर्व माहिती भरा.");
      return;
    }

    if (!/^[0-9]{10}$/.test(formData.mobile)) {
      setError("Mobile Number 10 अंकी असावा.");
      return;
    }

    if (formData.password.length < 6) {
      setError("Password कमीत कमी 6 characters असावा.");
      return;
    }

    const existingManagers =
      JSON.parse(localStorage.getItem("managers")) || [];

    const managerIdExists = existingManagers.some(
      (manager) =>
        manager.managerId.toLowerCase() ===
        formData.managerId.toLowerCase()
    );

    if (managerIdExists) {
      setError("हा Manager ID आधीपासून अस्तित्वात आहे.");
      return;
    }

    const emailExists = existingManagers.some(
      (manager) =>
        manager.email.toLowerCase() ===
        formData.email.toLowerCase()
    );

    if (emailExists) {
      setError("या Email वर Manager आधीपासून अस्तित्वात आहे.");
      return;
    }

    const newManager = {
      id: Date.now(),

      managerName: formData.managerName.trim(),
      managerId: formData.managerId.trim(),

      mobile: formData.mobile,
      email: formData.email.trim(),

      // फक्त frontend testing साठी.
      // Production मध्ये plain password कधीही store करायचा नाही.
      password: formData.password,

      role: "MANAGER",

      createdBySubAdminId: currentSubAdminId,

      status: "ACTIVE",

      createdAt: new Date().toISOString(),
    };

    const updatedManagers = [
      ...existingManagers,
      newManager,
    ];

    localStorage.setItem(
      "managers",
      JSON.stringify(updatedManagers)
    );

    setMessage("Manager यशस्वीरीत्या तयार झाला.");

    setFormData({
      managerName: "",
      managerId: "",
      mobile: "",
      email: "",
      password: "",
    });
  };

  return (
    <div className="create-manager-page">

      <div className="create-manager-container">

        {/* BACK */}

        <button
          type="button"
          className="manager-back-button"
          onClick={() =>
            navigate("/sub-admin/dashboard")
          }
        >
          ← BACK TO DASHBOARD
        </button>

        {/* HEADING */}

        <div className="create-manager-heading">

          <div className="manager-heading-icon">
            👤
          </div>

          <div>
            <span>SUB ADMIN MANAGEMENT</span>

            <h1>CREATE MANAGER</h1>

            <p>
              नवीन Manager account तयार करा
            </p>
          </div>

        </div>

        {/* FORM */}

        <form
          className="create-manager-form"
          onSubmit={handleSubmit}
        >

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
            />

          </div>

          <div className="manager-form-group">

            <label>
              MANAGER ID
            </label>

            <input
              type="text"
              name="managerId"
              value={formData.managerId}
              onChange={handleChange}
              placeholder="Ex: MGR-001"
            />

          </div>

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
              />

            </div>

            <div className="manager-form-group">

              <label>
                STATUS
              </label>

              <input
                type="text"
                value="ACTIVE"
                disabled
              />

            </div>

          </div>

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
            />

          </div>

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
            />

          </div>

          {error && (
            <div className="manager-form-error">
              {error}
            </div>
          )}

          {message && (
            <div className="manager-form-success">
              ✓ {message}
            </div>
          )}

          <button
            type="submit"
            className="create-manager-submit"
          >
            CREATE MANAGER
          </button>

        </form>

      </div>

    </div>
  );
}

export default CreateManager;