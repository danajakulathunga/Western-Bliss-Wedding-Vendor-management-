import { useState, useEffect } from "react";

const AdminPackages = () => {
    const [packages, setPackages] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [editingId, setEditingId] = useState(null);
    const [editPackage, setEditPackage] = useState({ packageName: "", price: "", description: "", image: "" });

    // State for Add Package Modal
    const [showModal, setShowModal] = useState(false);
    const [showEditModal, setShowEditModal] = useState(false);

    const [newPackage, setNewPackage] = useState({
        pckCode: "",
        packageName: "",
        price: "",
        description: "",
        image: "",
    });

    // Fetch packages
    useEffect(() => {
        const fetchPackages = async () => {
            try {
                const response = await fetch("http://localhost:8000/api/getpck");
                const data = await response.json();
                if (data.success) setPackages(data.data);
                else setError("Failed to load packages");
            } catch (err) {
                console.error("Error fetching packages:", err);
                setError("Error fetching packages");
            } finally {
                setLoading(false);
            }
        };
        fetchPackages();
    }, []);

    // Delete Package
    const handleDelete = async (id) => {
        if (!window.confirm("Are you sure you want to delete this package?")) return;

        try {
            const response = await fetch(`http://localhost:8000/api/deletepck/${id}`,
                { method: "DELETE" });
            const data = await response.json();
            if (data.success) setPackages(packages.filter((pkg) => pkg._id !== id));
            else alert("Failed to delete package");
        } catch (err) {
            console.error("Error deleting package:", err);
            alert("Error deleting package");
        }
    };

    // Open Edit Modal
    const handleEdit = (id) => {
        const pkg = packages.find((p) => p._id === id);
        setEditPackage(pkg);
        setEditingId(id);
        setShowEditModal(true);
    };

    // Save Edit
    const handleSaveEdit = async () => {
        try {
            const response = await fetch(`http://localhost:8000/api/updatepck/${editingId}`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(editPackage),
            });

            const data = await response.json();
            if (data.success) {
                setPackages(packages.map((pkg) => (pkg._id === editingId ? data.data : pkg)));
                setShowEditModal(false);
            } else {
                alert("Failed to update package");
            }
        } catch (err) {
            console.error("Error updating package:", err);
            alert("Error updating package");
        }
    };

    // Add New Package
    const handleAddPackage = async () => {
        if (!newPackage.pckCode || !newPackage.packageName || !newPackage.price || !newPackage.description || !newPackage.image) {
            alert("Please fill all fields!");
            return;
        }
        try {
            const response = await fetch("http://localhost:8000/api/addPack", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(newPackage),
            });
            const data = await response.json();
            if (data.success) {
                setPackages([...packages, data.data]);
                setShowModal(false);
                setNewPackage({ pckCode: "", packageName: "", price: "", description: "", image: "" });
            } else {
                alert(data.error);
            }
        } catch (err) {
            console.error("Error adding package:", err);
            alert("Error adding package");
        }
    };

    return (
        // 🔹 Background Image with Tailwind
        <div className="w-screen min-h-screen backdrop-blur-lg flex flex-col items-center p-10 bg-white bg-[url('./public/sadunika2.jpg')] bg-cover bg-center bg-no-repeat">
            <h2 className="text-5xl font-serif font-bold text-black-700 mb-6 shadow-md">Admin: Manage Wedding Packages</h2>

            {/* Package List */}
            <div className="mt-8 w-full max-w-4xl bg-white/80 p-6 rounded-xl shadow-lg">
                <h3 className="text-3xl font-serif font-semibold text-black mb-4 text-center">📦 Existing Packages</h3>

                {loading ? (
                    <p className="text-lg text-black text-center">Loading packages...</p>
                ) : error ? (
                    <p className="text-red-500 text-center">{error}</p>
                ) : (
                    <div className="w-full space-y-4">
                        {packages.map((pkg) => (
                            <div key={pkg._id} className="flex justify-between items-center p-4 bg-white rounded-xl shadow-md hover:shadow-lg transition">
                                <div>
                                    <span className="text-black font-serif font-semibold text-lg">{pkg.packageName}</span>
                                    <span className="text-gray-700 block">💰 Rs. {pkg.price.toLocaleString()}</span>
                                </div>
                                <div className="flex gap-3">
                                    <button className="bg-blue-500 text-black px-4 py-2 rounded-lg text-sm shadow-md" onClick={() => handleEdit(pkg._id)}>✏️ Edit</button>
                                    <button className="bg-red-500 text-black px-4 py-2 rounded-lg text-sm shadow-md" onClick={() => handleDelete(pkg._id)}>🗑️ Delete</button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Add Package Modal */}
            {showModal && (
                <div className="fixed inset-0 flex items-center justify-center bg-black/50">
                    <div className="bg-white p-6 rounded-lg w-1/3">
                        <h3 className="text-2xl font-serif font-bold text-black mb-4">➕ Add New Package</h3>
                        <input className="border p-2 w-full mb-2" type="text" placeholder="Package Name" onChange={(e) => setNewPackage({ ...newPackage, packageName: e.target.value })} />
                        <button className="bg-green-500 text-white px-4 py-2 rounded-md w-full" onClick={handleAddPackage}>✅ Add Package</button>
                    </div>
                </div>
            )}

            {/* Edit Package Modal */}
            {showEditModal && (
                <div className="fixed inset-0 flex items-center justify-center bg-black/50">
                    <div className="bg-white p-6 rounded-lg w-1/3">
                        <h3 className="text-2xl font-serif font-bold text-black mb-4">✏️ Edit Package</h3>
                        <input className="border p-2 w-full mb-2" type="text" placeholder="Package Name" value={editPackage.packageName} onChange={(e) => setEditPackage({ ...editPackage, packageName: e.target.value })} />
                        <input className="border p-2 w-full mb-2" type="number" placeholder="Price" value={editPackage.price} onChange={(e) => setEditPackage({ ...editPackage, price: e.target.value })} />
                        <button className="bg-blue-500 text-black px-4 py-2 rounded-md w-full" onClick={handleSaveEdit}>💾 Save Changes</button>
                        <button className="bg-gray-400 text-black px-4 py-2 rounded-md w-full mt-2" onClick={() => setShowEditModal(false)}>❌ Cancel</button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AdminPackages;
