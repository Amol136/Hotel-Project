import { useState } from "react";
import { useNavigate } from "react-router-dom";
import "../../styles/forms.css";

function CreateSubAdmin() {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    name: "",
    subAdminId: "",
    mobile: "",
    email: "",
    password: "",
  });

  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const handleChange = (event) => {
    const { name, value } = event.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    setMessage("");
    setError("");
  };

  const handleSubmit = (event) => {
    event.preventDefault();

    if (
      !formData.name ||
      !formData.subAdminId ||
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

    const existing =
      JSON.parse(localStorage.getItem("subAdmins")) || [];

    const duplicateId = existing.some(
      (item) =>
        item.subAdminId.toLowerCase() ===
        formData.subAdminId.toLowerCase()
    );

    if (duplicateId) {
      setError("हा Sub Admin ID आधीपासून अस्तित्वात आहे.");
      return;
    }

    const duplicateEmail = existing.some(
      (item) =>
        item.email.toLowerCase() ===
        formData.email.toLowerCase()
    );

    if (duplicateEmail) {
      setError(
        "या Email वर Sub Admin आधीपासून अस्तित्वात आहे."
      );
      return;
    }

    const newSubAdmin = {
      id: Date.now(),
      name: formData.name.trim(),
      subAdminId: formData.subAdminId.trim(),
      mobile: formData.mobile,
      email: formData.email.trim(),

      // फक्त frontend testing साठी
      password: formData.password,

      role: "SUB_ADMIN",
      status: "ACTIVE",
      createdAt: new Date().toISOString(),
    };

    const updated = [...existing, newSubAdmin];

    localStorage.setItem(
      "subAdmins",
      JSON.stringify(updated)
    );

    setMessage("Sub Admin यशस्वीरीत्या तयार झाला.");

    setFormData({
      name: "",
      subAdminId: "",
      mobile: "",
      email: "",
      password: "",
    });
  };

  return (
    <div className="create-subadmin-page">

      <div className="create-subadmin-container">

        <button
          className="subadmin-back-btn"
          onClick={() =>
            navigate("/main-admin/dashboard")
          }
        >
          ← BACK TO DASHBOARD
        </button>

        <div className="create-subadmin-heading">

          <div className="subadmin-heading-icon">
            🏢
          </div>

          <div>
            <span>MAIN ADMIN MANAGEMENT</span>

            <h1>CREATE SUB ADMIN</h1>

            <p>
              नवीन Sub Admin account तयार करा
            </p>
          </div>

        </div>

        <form
          className="create-subadmin-form"
          onSubmit={handleSubmit}
        >

          {/* SUB ADMIN NAME */}

          <div className="subadmin-form-group">

            <label>SUB ADMIN NAME</label>

            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              placeholder="Ex: Rahul Patil"
            />

          </div>

          {/* SUB ADMIN ID */}

          <div className="subadmin-form-group">

            <label>SUB ADMIN ID</label>

            <input
              type="text"
              name="subAdminId"
              value={formData.subAdminId}
              onChange={handleChange}
              placeholder="Ex: SUBADMIN-001"
            />

          </div>

          {/* MOBILE NUMBER */}

          <div className="subadmin-form-group">

            <label>MOBILE NUMBER</label>

            <input
              type="tel"
              name="mobile"
              maxLength="10"
              value={formData.mobile}
              onChange={handleChange}
              placeholder="10-digit number"
            />

          </div>

          {/* EMAIL ADDRESS */}

          <div className="subadmin-form-group">

            <label>EMAIL ADDRESS</label>

            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="subadmin@example.com"
            />

          </div>

          {/* LOGIN PASSWORD */}

          <div className="subadmin-form-group">

            <label>LOGIN PASSWORD</label>

            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              placeholder="Minimum 6 characters"
            />

          </div>

          {/* ERROR */}

          {error && (
            <div className="subadmin-form-error">
              {error}
            </div>
          )}

          {/* SUCCESS */}

          {message && (
            <div className="subadmin-form-success">
              ✓ {message}
            </div>
          )}

          {/* CREATE BUTTON */}

          <button
            type="submit"
            className="create-subadmin-submit"
          >
            CREATE SUB ADMIN
          </button>

        </form>

      </div>

    </div>
  );
}

export default CreateSubAdmin;