import { useState } from "react";
import { useNavigate } from "react-router-dom";
import "../../styles/forms.css";

function CreateSubAdmin() {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    name: "",
    subAdminId: "",
    propertyName: "",
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
      !formData.propertyName ||
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
      setError("या Email वर Sub Admin आधीपासून अस्तित्वात आहे.");
      return;
    }

    const newSubAdmin = {
      id: Date.now(),
      name: formData.name.trim(),
      subAdminId: formData.subAdminId.trim(),
      propertyName: formData.propertyName.trim(),
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
      propertyName: "",
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

          <div className="subadmin-form-group">
            <label>HOTEL / PROPERTY NAME</label>

            <input
              type="text"
              name="propertyName"
              value={formData.propertyName}
              onChange={handleChange}
              placeholder="Ex: Standard Stay"
            />
          </div>

          <div className="subadmin-two-column">

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

            <div className="subadmin-form-group">
              <label>STATUS</label>

              <input
                type="text"
                value="ACTIVE"
                disabled
              />
            </div>

          </div>

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

          {error && (
            <div className="subadmin-form-error">
              {error}
            </div>
          )}

          {message && (
            <div className="subadmin-form-success">
              ✓ {message}
            </div>
          )}

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