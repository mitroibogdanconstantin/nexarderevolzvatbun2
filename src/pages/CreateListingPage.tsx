import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";

// If you still get "Cannot find module 'lucide-react'" after installing, try this workaround:
import {
	X,
	Plus,
	Check,
	AlertTriangle,
	Camera,
	Store,
	Clock,
} from "lucide-react";
// If the error persists, ensure you have installed lucide-react with:
// npm install lucide-react
// and that your node_modules are not excluded by your tsconfig.json or IDE.
import {
	listings,
	isAuthenticated,
	supabase,
	romanianCities,
} from "../lib/supabase";
import SuccessModal from "../components/SuccessModal";
import FixSupabaseButton from "../components/FixSupabaseButton";

const CreateListingPage = () => {
	const [currentStep, setCurrentStep] = useState(1);
	const [images, setImages] = useState<string[]>([]);
	const [imageFiles, setImageFiles] = useState<File[]>([]);
	const [errors, setErrors] = useState<Record<string, string>>({});
	const [isSubmitting, setIsSubmitting] = useState(false);
	const [userProfile, setUserProfile] = useState<any>(null);
	const [isLoadingProfile, setIsLoadingProfile] = useState(true);
	const [showSuccessModal, setShowSuccessModal] = useState(false);
	const [createdListingId, setCreatedListingId] = useState<string | null>(null);
	const navigate = useNavigate();
	const submitAttempts = useRef(0);
	const maxSubmitAttempts = 3;

	const [formData, setFormData] = useState({
		title: "",
		category: "",
		brand: "",
		model: "",
		year: "",
		mileage: "",
		engine: "",
		fuel: "",
		transmission: "",
		color: "",
		condition: "",
		price: "",
		location: "",
		description: "",
		features: [] as string[],
		phone: "",
		email: "",
		availability: "pe_stoc", // Default value
	});

	type Availability = "pe_stoc" | "la_comanda";

	const availabilityValue: Availability =
		formData.availability === "la_comanda" ? "la_comanda" : "pe_stoc";

	// Check if user is logged in and load profile
	useEffect(() => {
		checkAuthAndLoadProfile();
	}, []);

	const checkAuthAndLoadProfile = async () => {
		try {
			setIsLoadingProfile(true);

			const isLoggedIn = await isAuthenticated();
			if (!isLoggedIn) {
				navigate("/auth");
				return;
			}

			// Get current user
			const {
				data: { user },
			} = await supabase.auth.getUser();
			if (!user) {
				navigate("/auth");
				return;
			}

			// Get user profile from database
			const { data: profileData, error: profileError } = await supabase
				.from("profiles")
				.select("*")
				.eq("user_id", user.id)
				.single();

			if (profileError) {
				console.error("❌ Eroare la încărcarea profilului:", profileError);
				// If profile doesn't exist, redirect to profile page to create it
				navigate("/profil");
				return;
			}

			if (profileData) {
				setUserProfile(profileData);

				// Pre-fill form with user data
				setFormData((prev) => ({
					...prev,
					email: profileData.email || "",
					phone: profileData.phone || "",
					location: "", // Reset location to empty string instead of pre-filling
				}));
			}
		} catch (error) {
			console.error("Error checking auth and loading profile:", error);
			navigate("/auth");
		} finally {
			setIsLoadingProfile(false);
		}
	};

	const steps = [
		{
			id: 1,
			title: "Informații de bază",
			description: "Detalii despre motocicletă",
		},
		{ id: 2, title: "Fotografii", description: "Adaugă până la 5 poze" },
		{ id: 3, title: "Descriere și preț", description: "Detalii complete" },
		{ id: 4, title: "Contact", description: "Informații de contact" },
	];

	const categories = [
		"Sport",
		"Touring",
		"Cruiser",
		"Adventure",
		"Naked",
		"Scooter",
		"Enduro",
		"Chopper",
	];
	const brands = [
		"Yamaha",
		"Honda",
		"Suzuki",
		"Kawasaki",
		"BMW",
		"Ducati",
		"KTM",
		"Aprilia",
		"Triumph",
		"Harley-Davidson",
		"MV Agusta",
		"Benelli",
		"Moto Guzzi",
		"Indian",
		"Zero",
		"Energica",
		"Husqvarna",
		"Beta",
		"Sherco",
		"GasGas",
	];
	const fuelTypes = ["Benzină", "Electric", "Hibrid"];
	const transmissionTypes = ["Manual", "Automat", "Semi-automat"];
	const conditions = [
		"Nouă",
		"Excelentă",
		"Foarte bună",
		"Bună",
		"Satisfăcătoare",
	];

	const availabilityOptions = [
		{ value: "pe_stoc", label: "Pe stoc" },
		{ value: "la_comanda", label: "La comandă" },
	];

	const availableFeatures = [
		"ABS",
		"Control tracțiune",
		"Suspensie reglabilă",
		"Frâne Brembo",
		"Quickshifter",
		"Sistem de navigație",
		"Încălzire mânere",
		"LED complet",
		"Bluetooth",
		"USB",
		"Geantă laterală",
		"Parbriz reglabil",
		"Scaun încălzit",
		"Tempomat",
		"Sistem anti-furt",
		"Jante aliaj",
	];

	// Mapare pentru valorile din baza de date
	const mapValueForDatabase = (field: string, value: string): string => {
		switch (field) {
			case "category":
				return value.toLowerCase();

			case "fuel":
				const fuelMap: Record<string, string> = {
					Benzină: "benzina",
					Electric: "electric",
					Hibrid: "hibrid",
				};
				return fuelMap[value] || value.toLowerCase();

			case "transmission":
				const transmissionMap: Record<string, string> = {
					Manual: "manuala",
					Automat: "automata",
					"Semi-automat": "semi-automata",
				};
				return transmissionMap[value] || value.toLowerCase();

			case "condition":
				const conditionMap: Record<string, string> = {
					Nouă: "noua",
					Excelentă: "excelenta",
					"Foarte bună": "foarte_buna",
					Bună: "buna",
					Satisfăcătoare: "satisfacatoare",
				};
				return conditionMap[value] || value.toLowerCase();

			default:
				return value;
		}
	};

	const validateStep = (step: number): boolean => {
		const newErrors: Record<string, string> = {};

		switch (step) {
			case 1:
				if (!formData.title.trim()) newErrors.title = "Titlul este obligatoriu";
				if (formData.title.length > 100)
					newErrors.title = "Titlul nu poate depăși 100 de caractere";

				if (!formData.category)
					newErrors.category = "Categoria este obligatorie";
				if (!formData.brand) newErrors.brand = "Marca este obligatorie";
				if (!formData.model.trim())
					newErrors.model = "Modelul este obligatoriu";

				if (!formData.year) {
					newErrors.year = "Anul este obligatoriu";
				} else {
					const year = parseInt(formData.year);
					const currentYear = new Date().getFullYear();
					if (year < 1990 || year > currentYear + 1) {
						newErrors.year = `Anul trebuie să fie între 1990 și ${
							currentYear + 1
						}`;
					}
				}

				if (!formData.mileage) {
					newErrors.mileage = "Kilometrajul este obligatoriu";
				} else {
					const mileage = parseInt(formData.mileage);
					if (mileage < 0 || mileage > 500000) {
						newErrors.mileage =
							"Kilometrajul trebuie să fie între 0 și 500,000 km";
					}
				}

				if (!formData.engine) {
					newErrors.engine = "Capacitatea motorului este obligatorie";
				} else {
					const engine = parseInt(formData.engine);
					if (engine < 50 || engine > 3000) {
						newErrors.engine =
							"Capacitatea motorului trebuie să fie între 50 și 3000 cc";
					}
				}

				if (!formData.fuel)
					newErrors.fuel = "Tipul de combustibil este obligatoriu";
				if (!formData.transmission)
					newErrors.transmission = "Transmisia este obligatorie";
				if (!formData.color.trim())
					newErrors.color = "Culoarea este obligatorie";
				if (!formData.condition)
					newErrors.condition = "Starea este obligatorie";
				if (!formData.location.trim()) {
					newErrors.location = "Locația este obligatorie";
				} else if (!romanianCities.includes(formData.location.trim())) {
					newErrors.location =
						"Te rugăm să selectezi un oraș din lista disponibilă";
				}

				// Verifică disponibilitatea pentru dealeri
				if (userProfile?.seller_type === "dealer" && !formData.availability) {
					newErrors.availability =
						"Disponibilitatea este obligatorie pentru dealeri";
				}
				break;

			case 2:
				if (imageFiles.length === 0) {
					newErrors.images = "Trebuie să adaugi cel puțin o fotografie";
				}
				break;

			case 3:
				if (!formData.price) {
					newErrors.price = "Prețul este obligatoriu";
				} else {
					const price = parseFloat(formData.price);
					if (price < 100 || price > 1000000) {
						newErrors.price =
							"Prețul trebuie să fie între 100 și 1,000,000 EUR";
					}
				}

				// Descrierea nu mai este obligatorie
				if (
					formData.description.trim().length > 0 &&
					formData.description.length > 2000
				) {
					newErrors.description =
						"Descrierea nu poate depăși 2000 de caractere";
				}
				break;

			case 4:
				if (!formData.phone.trim()) {
					newErrors.phone = "Numărul de telefon este obligatoriu";
				} else if (
					!/^[0-9+\-\s()]{10,15}$/.test(formData.phone.replace(/\s/g, ""))
				) {
					newErrors.phone = "Numărul de telefon nu este valid";
				}

				if (!formData.email.trim()) {
					newErrors.email = "Email-ul este obligatoriu";
				} else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
					newErrors.email = "Email-ul nu este valid";
				}
				break;
		}

		setErrors(newErrors);
		return Object.keys(newErrors).length === 0;
	};

	const handleInputChange = (field: string, value: string | boolean) => {
		setFormData((prev) => ({ ...prev, [field]: value }));

		// Clear error when user starts typing
		if (errors[field]) {
			setErrors((prev) => ({ ...prev, [field]: "" }));
		}
	};

	const handleFeatureToggle = (feature: string) => {
		setFormData((prev) => ({
			...prev,
			features: prev.features.includes(feature)
				? prev.features.filter((f) => f !== feature)
				: [...prev.features, feature],
		}));
	};

	const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
		const files = e.target.files;
		if (files && imageFiles.length < 5) {
			const newImageFiles = Array.from(files).slice(0, 5 - imageFiles.length);

			// Verificăm fiecare fișier
			for (const file of newImageFiles) {
				// Validare dimensiune (max 5MB)
				if (file.size > 5 * 1024 * 1024) {
					setErrors((prev) => ({
						...prev,
						images: "Fișierul nu poate depăși 5MB",
					}));
					return;
				}

				// Validare tip fișier
				if (!file.type.startsWith("image/")) {
					setErrors((prev) => ({
						...prev,
						images: "Doar fișiere imagine sunt permise",
					}));
					return;
				}
			}

			// Adăugăm fișierele valide
			setImageFiles((prev) => [...prev, ...newImageFiles]);

			// Generăm URL-uri pentru previzualizare
			newImageFiles.forEach((file) => {
				const reader = new FileReader();
				reader.onload = (e) => {
					if (e.target?.result) {
						setImages((prev) => [...prev, e.target!.result as string]);
						// Clear image errors when successfully adding
						setErrors((prev) => ({ ...prev, images: "" }));
					}
				};
				reader.readAsDataURL(file);
			});
		}
	};

	const removeImage = (index: number) => {
		setImages((prev) => prev.filter((_, i) => i !== index));
		setImageFiles((prev) => prev.filter((_, i) => i !== index));
	};

	const nextStep = () => {
		if (validateStep(currentStep)) {
			if (currentStep < 4) setCurrentStep(currentStep + 1);
		}
	};

	const prevStep = () => {
		if (currentStep > 1) setCurrentStep(currentStep - 1);
	};

	// ... alte logici ...

	const handleSubmit = async () => {
		if (!validateStep(4)) return;

		setIsSubmitting(true);
		submitAttempts.current += 1;

		try {
			if (!userProfile) {
				throw new Error("Profilul utilizatorului nu a fost găsit");
			}

			const { data: authUser, error: authError } =
				await supabase.auth.getUser();

			if (authError || !authUser) {
				console.error(
					"❌ Eroare la obținerea utilizatorului curent:",
					authError,
				);
				throw new Error("Utilizatorul nu este autentificat");
			}

			console.log("🔐 UID din auth:", authUser.user.id);
			console.log("🆔 seller_id din profil (user_id):", userProfile.user_id); // Log the correct user_id
			console.log("🆔 id-ul profilului (id):", userProfile.id); // Log the profile id

			if (userProfile.user_id !== authUser.user.id) {
				console.error("🚫 Mismatch între userProfile.user_id și auth.uid()");
				throw new Error("UID mismatch: seller_id diferit de auth.uid()");
			}

			console.log("🚀 Starting listing creation...");
			console.log("📋 Form data before mapping:", formData);

			// Pregătim datele pentru anunț cu maparea corectă
			const listingData = {
				title: formData.title.trim(),
				description: formData.description.trim() || "",
				price: parseFloat(formData.price),
				year: parseInt(formData.year),
				mileage: parseInt(formData.mileage),
				location: formData.location.trim(),
				category: mapValueForDatabase("category", formData.category),
				brand: formData.brand,
				model: formData.model.trim(),
				engine_capacity: parseInt(formData.engine),
				fuel_type: mapValueForDatabase("fuel", formData.fuel),
				transmission: mapValueForDatabase(
					"transmission",
					formData.transmission,
				),
				condition: mapValueForDatabase("condition", formData.condition),
				color: formData.color.trim(),
				features: formData.features,
				seller_id: userProfile.id, // AICI ESTE CORECȚIA: Folosește userProfile.user_id
				seller_name: userProfile.name || "Utilizator",
				seller_type: userProfile.seller_type,
				status: "pending",
				availability: availabilityValue,
			};

			console.log("availability:", listingData.availability);
			console.log("📝 Mapped listing data:", listingData);

			// Folosim o abordare mai robustă pentru încărcarea imaginilor
			// Împărțim procesul în două etape pentru a evita timeout-urile
			
			// 1. Mai întâi creăm anunțul fără imagini
			const initialListingData = {
				...listingData,
				images: [] // Inițial fără imagini
			};
			
			console.log("🔥 seller_id înainte de inserție:", initialListingData.seller_id);
			console.log("🔐 authUser.user.id înainte de inserție:", authUser.user.id);
			
			// Creăm anunțul inițial
			const { data: initialListing, error: initialError } = await supabase
				.from("listings")
				.insert([initialListingData])
				.select()
				.single();
				
			if (initialError) {
				console.error("❌ Error creating initial listing:", initialError);
				throw new Error(initialError.message || "Eroare la crearea anunțului");
			}
			
			console.log("✅ Initial listing created successfully:", initialListing);
			
			// 2. Apoi încărcăm imaginile și actualizăm anunțul
			if (imageFiles.length > 0) {
				const imageUrls: string[] = [];
				
				for (const image of imageFiles) {
					try {
						const fileExt = image.name.split(".").pop();
						const fileName = `${Date.now()}-${Math.random().toString(36).substring(2, 15)}.${fileExt}`;
						const filePath = `${userProfile.id}/${fileName}`;

						console.log(`📤 Uploading image: ${fileName}`);

						const { error: uploadError, data: uploadData } =
							await supabase.storage
								.from("listing-images")
								.upload(filePath, image, {
									cacheControl: "3600",
									upsert: false,
								});

						if (uploadError) {
							console.error("❌ Error uploading image:", uploadError);
							continue; // Continuăm cu următoarea imagine
						}

						console.log("✅ Image uploaded:", uploadData?.path);

						// Obținem URL-ul public pentru imagine
						const {
							data: { publicUrl },
						} = supabase.storage.from("listing-images").getPublicUrl(filePath);

						console.log("🔗 Public URL:", publicUrl);
						imageUrls.push(publicUrl);
					} catch (uploadErr) {
						console.error("❌ Unexpected error uploading image:", uploadErr);
						// Continuăm cu următoarea imagine
					}
				}
				
				// Actualizăm anunțul cu imaginile încărcate
				if (imageUrls.length > 0) {
					const { error: updateError } = await supabase
						.from("listings")
						.update({ images: imageUrls })
						.eq("id", initialListing.id);
						
					if (updateError) {
						console.error("❌ Error updating listing with images:", updateError);
						// Nu aruncăm eroare aici, continuăm cu anunțul creat
					}
				}
			}
			
			setCreatedListingId(initialListing.id);
			setShowSuccessModal(true);
			
		} catch (error: any) {
			console.error("💥 Error creating listing:", error);
			
			// Verificăm dacă mai putem încerca din nou
			if (submitAttempts.current < maxSubmitAttempts) {
				console.log(`🔄 Retrying submission (attempt ${submitAttempts.current}/${maxSubmitAttempts})...`);
				setTimeout(() => {
					setIsSubmitting(false);
					handleSubmit(); // Încercăm din nou
				}, 1000); // Așteptăm 1 secundă înainte de a reîncerca
				return;
			}
			
			setErrors({
				submit:
					error.message ||
					"A apărut o eroare la publicarea anunțului. Te rog încearcă din nou.",
			});
			setIsSubmitting(false);
		} finally {
			if (submitAttempts.current >= maxSubmitAttempts || showSuccessModal) {
				setIsSubmitting(false);
				submitAttempts.current = 0;
			}
		}
	};

	const handleSuccessModalClose = () => {
		setShowSuccessModal(false);
	};

	const handleGoHome = () => {
		setShowSuccessModal(false);
		navigate("/");
	};

	const handleViewListing = () => {
		if (createdListingId) {
			setShowSuccessModal(false);
			navigate(`/anunt/${createdListingId}`);
		}
	};

	// Loading state
	if (isLoadingProfile) {
		return (
			<div className="min-h-screen bg-gray-50 flex items-center justify-center">
				<div className="bg-white p-8 rounded-2xl shadow-lg text-center">
					<div className="w-16 h-16 border-4 border-nexar-accent border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
					<p className="text-gray-600">Se încarcă datele profilului...</p>
				</div>
			</div>
		);
	}

	// No profile found
	if (!userProfile) {
		return (
			<div className="min-h-screen bg-gray-50 flex items-center justify-center">
				<div className="bg-white p-8 rounded-2xl shadow-lg text-center max-w-md">
					<AlertTriangle className="h-16 w-16 text-red-500 mx-auto mb-4" />
					<h2 className="text-2xl font-bold text-gray-900 mb-2">
						Profil incomplet
					</h2>
					<p className="text-gray-600 mb-6">
						{errors.profile ||
							"Pentru a adăuga un anunț, trebuie să îți completezi profilul mai întâi."}
					</p>
					<div className="flex flex-col sm:flex-row gap-4">
						<button
							onClick={() => navigate("/profil")}
							className="bg-nexar-accent text-white px-6 py-3 rounded-lg font-semibold hover:bg-nexar-gold transition-colors"
						>
							Completează Profilul
						</button>
						<FixSupabaseButton buttonText="Repară Conexiunea" />
					</div>
				</div>
			</div>
		);
	}

	return (
		<div className="min-h-screen bg-gray-50 py-8">
			<div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
				{/* Header */}
				<div className="text-center mb-8">
					<h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
						Adaugă Anunț Nou
					</h1>
					<p className="text-gray-600 text-lg">
						Completează formularul pentru a-ți publica motocicleta
					</p>

					{/* User Info Display */}
					<div className="mt-4 inline-flex items-center space-x-3 bg-white rounded-lg px-4 py-2 shadow-sm border">
						<div className="w-8 h-8 bg-nexar-accent rounded-full flex items-center justify-center text-white font-semibold text-sm">
							{userProfile.name
								? userProfile.name.charAt(0).toUpperCase()
								: "U"}
						</div>
						<div className="text-left">
							<div className="font-semibold text-gray-900">
								{userProfile.name}
							</div>
							<div className="text-xs text-gray-600">
								{userProfile.seller_type === "dealer"
									? "Dealer Verificat"
									: "Vânzător Privat"}
							</div>
						</div>
					</div>
				</div>

				{/* Progress Steps */}
				<div className="mb-8">
					<div className="flex items-center justify-between">
						{steps.map((step, index) => (
							<div key={step.id} className="flex items-center">
								<div
									className={`flex items-center justify-center w-10 h-10 rounded-full border-2 transition-colors ${
										currentStep >= step.id
											? "bg-gray-900 border-gray-900 text-white"
											: "border-gray-300 text-gray-400"
									}`}
								>
									{currentStep > step.id ? (
										<Check className="h-5 w-5" />
									) : (
										<span className="font-semibold">{step.id}</span>
									)}
								</div>
								{index < steps.length - 1 && (
									<div
										className={`w-full h-1 mx-4 transition-colors ${
											currentStep > step.id ? "bg-gray-900" : "bg-gray-300"
										}`}
									/>
								)}
							</div>
						))}
					</div>
					<div className="mt-4 text-center">
						<h2 className="text-xl font-semibold text-gray-900">
							{steps[currentStep - 1].title}
						</h2>
						<p className="text-gray-600">
							{steps[currentStep - 1].description}
						</p>
					</div>
				</div>

				{/* Form Content */}
				<div className="bg-white rounded-2xl shadow-lg p-8">
					{/* Step 1: Basic Information */}
					{currentStep === 1 && (
						<div className="space-y-6 animate-fade-in">
							<div className="grid grid-cols-1 md:grid-cols-2 gap-6">
								<div>
									<label className="block text-sm font-medium text-gray-700 mb-2">
										Titlu anunț *
									</label>
									<input
										type="text"
										value={formData.title}
										onChange={(e) => handleInputChange("title", e.target.value)}
										className={`w-full border rounded-lg px-4 py-3 focus:ring-2 focus:ring-gray-900 focus:border-transparent ${
											errors.title ? "border-red-500" : "border-gray-300"
										}`}
										placeholder="ex: Yamaha YZF-R1 2023"
										maxLength={100}
									/>
									{errors.title && (
										<p className="mt-1 text-sm text-red-600 flex items-center">
											<AlertTriangle className="h-4 w-4 mr-1" />
											{errors.title}
										</p>
									)}
									<p className="mt-1 text-xs text-gray-500">
										{formData.title.length}/100 caractere
									</p>
								</div>

								<div>
									<label className="block text-sm font-medium text-gray-700 mb-2">
										Categorie *
									</label>
									<select
										value={formData.category}
										onChange={(e) =>
											handleInputChange("category", e.target.value)
										}
										className={`w-full border rounded-lg px-4 py-3 focus:ring-2 focus:ring-gray-900 focus:border-transparent ${
											errors.category ? "border-red-500" : "border-gray-300"
										}`}
									>
										<option value="">Selectează categoria</option>
										{categories.map((cat) => (
											<option key={cat} value={cat}>
												{cat}
											</option>
										))}
									</select>
									{errors.category && (
										<p className="mt-1 text-sm text-red-600 flex items-center">
											<AlertTriangle className="h-4 w-4 mr-1" />
											{errors.category}
										</p>
									)}
								</div>

								<div>
									<label className="block text-sm font-medium text-gray-700 mb-2">
										Marcă *
									</label>
									<select
										value={formData.brand}
										onChange={(e) => handleInputChange("brand", e.target.value)}
										className={`w-full border rounded-lg px-4 py-3 focus:ring-2 focus:ring-gray-900 focus:border-transparent ${
											errors.brand ? "border-red-500" : "border-gray-300"
										}`}
									>
										<option value="">Selectează marca</option>
										{brands.map((brand) => (
											<option key={brand} value={brand}>
												{brand}
											</option>
										))}
									</select>
									{errors.brand && (
										<p className="mt-1 text-sm text-red-600 flex items-center">
											<AlertTriangle className="h-4 w-4 mr-1" />
											{errors.brand}
										</p>
									)}
								</div>

								<div>
									<label className="block text-sm font-medium text-gray-700 mb-2">
										Model *
									</label>
									<input
										type="text"
										value={formData.model}
										onChange={(e) => handleInputChange("model", e.target.value)}
										className={`w-full border rounded-lg px-4 py-3 focus:ring-2 focus:ring-gray-900 focus:border-transparent ${
											errors.model ? "border-red-500" : "border-gray-300"
										}`}
										placeholder="ex: YZF-R1"
									/>
									{errors.model && (
										<p className="mt-1 text-sm text-red-600 flex items-center">
											<AlertTriangle className="h-4 w-4 mr-1" />
											{errors.model}
										</p>
									)}
								</div>

								<div>
									<label className="block text-sm font-medium text-gray-700 mb-2">
										An fabricație *
									</label>
									<input
										type="number"
										value={formData.year}
										onChange={(e) => handleInputChange("year", e.target.value)}
										className={`w-full border rounded-lg px-4 py-3 focus:ring-2 focus:ring-gray-900 focus:border-transparent ${
											errors.year ? "border-red-500" : "border-gray-300"
										}`}
										placeholder="2023"
										min="1990"
										max="2025"
									/>
									{errors.year && (
										<p className="mt-1 text-sm text-red-600 flex items-center">
											<AlertTriangle className="h-4 w-4 mr-1" />
											{errors.year}
										</p>
									)}
								</div>

								<div>
									<label className="block text-sm font-medium text-gray-700 mb-2">
										Kilometraj *
									</label>
									<input
										type="number"
										value={formData.mileage}
										onChange={(e) =>
											handleInputChange("mileage", e.target.value)
										}
										className={`w-full border rounded-lg px-4 py-3 focus:ring-2 focus:ring-gray-900 focus:border-transparent ${
											errors.mileage ? "border-red-500" : "border-gray-300"
										}`}
										placeholder="25000"
										min="0"
										max="500000"
									/>
									{errors.mileage && (
										<p className="mt-1 text-sm text-red-600 flex items-center">
											<AlertTriangle className="h-4 w-4 mr-1" />
											{errors.mileage}
										</p>
									)}
								</div>

								<div>
									<label className="block text-sm font-medium text-gray-700 mb-2">
										Capacitate motor (cc) *
									</label>
									<input
										type="number"
										value={formData.engine}
										onChange={(e) =>
											handleInputChange("engine", e.target.value)
										}
										className={`w-full border rounded-lg px-4 py-3 focus:ring-2 focus:ring-gray-900 focus:border-transparent ${
											errors.engine ? "border-red-500" : "border-gray-300"
										}`}
										placeholder="998"
										min="50"
										max="3000"
									/>
									{errors.engine && (
										<p className="mt-1 text-sm text-red-600 flex items-center">
											<AlertTriangle className="h-4 w-4 mr-1" />
											{errors.engine}
										</p>
									)}
								</div>

								<div>
									<label className="block text-sm font-medium text-gray-700 mb-2">
										Combustibil *
									</label>
									<select
										value={formData.fuel}
										onChange={(e) => handleInputChange("fuel", e.target.value)}
										className={`w-full border rounded-lg px-4 py-3 focus:ring-2 focus:ring-gray-900 focus:border-transparent ${
											errors.fuel ? "border-red-500" : "border-gray-300"
										}`}
									>
										<option value="">Selectează combustibilul</option>
										{fuelTypes.map((fuel) => (
											<option key={fuel} value={fuel}>
												{fuel}
											</option>
										))}
									</select>
									{errors.fuel && (
										<p className="mt-1 text-sm text-red-600 flex items-center">
											<AlertTriangle className="h-4 w-4 mr-1" />
											{errors.fuel}
										</p>
									)}
								</div>

								<div>
									<label className="block text-sm font-medium text-gray-700 mb-2">
										Transmisie *
									</label>
									<select
										value={formData.transmission}
										onChange={(e) =>
											handleInputChange("transmission", e.target.value)
										}
										className={`w-full border rounded-lg px-4 py-3 focus:ring-2 focus:ring-gray-900 focus:border-transparent ${
											errors.transmission ? "border-red-500" : "border-gray-300"
										}`}
									>
										<option value="">Selectează transmisia</option>
										{transmissionTypes.map((trans) => (
											<option key={trans} value={trans}>
												{trans}
											</option>
										))}
									</select>
									{errors.transmission && (
										<p className="mt-1 text-sm text-red-600 flex items-center">
											<AlertTriangle className="h-4 w-4 mr-1" />
											{errors.transmission}
										</p>
									)}
								</div>

								<div>
									<label className="block text-sm font-medium text-gray-700 mb-2">
										Culoare *
									</label>
									<input
										type="text"
										value={formData.color}
										onChange={(e) => handleInputChange("color", e.target.value)}
										className={`w-full border rounded-lg px-4 py-3 focus:ring-2 focus:ring-gray-900 focus:border-transparent ${
											errors.color ? "border-red-500" : "border-gray-300"
										}`}
										placeholder="ex: Albastru Racing"
									/>
									{errors.color && (
										<p className="mt-1 text-sm text-red-600 flex items-center">
											<AlertTriangle className="h-4 w-4 mr-1" />
											{errors.color}
										</p>
									)}
								</div>

								<div>
									<label className="block text-sm font-medium text-gray-700 mb-2">
										Starea *
									</label>
									<select
										value={formData.condition}
										onChange={(e) =>
											handleInputChange("condition", e.target.value)
										}
										className={`w-full border rounded-lg px-4 py-3 focus:ring-2 focus:ring-gray-900 focus:border-transparent ${
											errors.condition ? "border-red-500" : "border-gray-300"
										}`}
									>
										<option value="">Selectează starea</option>
										{conditions.map((condition) => (
											<option key={condition} value={condition}>
												{condition}
											</option>
										))}
									</select>
									{errors.condition && (
										<p className="mt-1 text-sm text-red-600 flex items-center">
											<AlertTriangle className="h-4 w-4 mr-1" />
											{errors.condition}
										</p>
									)}
								</div>

								<div>
									<label className="block text-sm font-medium text-gray-700 mb-2">
										Locația *
									</label>
									<select
										value={formData.location}
										onChange={(e) =>
											handleInputChange("location", e.target.value)
										}
										className={`w-full border rounded-lg px-4 py-3 focus:ring-2 focus:ring-gray-900 focus:border-transparent ${
											errors.location ? "border-red-500" : "border-gray-300"
										}`}
									>
										<option value="">Selectează orașul</option>

										{romanianCities.map((city) => (
											<option key={city} value={city}>
												{city}
											</option>
										))}
									</select>
									{errors.location && (
										<p className="mt-1 text-sm text-red-600 flex items-center">
											<AlertTriangle className="h-4 w-4 mr-1" />
											{errors.location}
										</p>
									)}
								</div>

								{/* Availability field - only for dealers */}
								{userProfile.seller_type === "dealer" && (
									<div>
										<label className="block text-sm font-medium text-gray-700 mb-2">
											Disponibilitate *
										</label>
										<div className="flex space-x-4">
											{availabilityOptions.map((option) => (
												<label
													key={option.value}
													className={`flex items-center space-x-2 border rounded-lg px-4 py-3 cursor-pointer transition-colors ${
														formData.availability === option.value
															? "border-nexar-accent bg-nexar-accent/5"
															: "border-gray-300 hover:bg-gray-50"
													}`}
												>
													<input
														type="radio"
														name="availability"
														value={option.value}
														checked={formData.availability === option.value}
														onChange={(e) =>
															handleInputChange("availability", e.target.value)
														}
														className="sr-only"
													/>
													{option.value === "pe_stoc" ? (
														<Store
															className={`h-5 w-5 ${
																formData.availability === option.value
																	? "text-nexar-accent"
																	: "text-gray-400"
															}`}
														/>
													) : (
														<Clock
															className={`h-5 w-5 ${
																formData.availability === option.value
																	? "text-nexar-accent"
																	: "text-gray-400"
															}`}
														/>
													)}
													<span
														className={
															formData.availability === option.value
																? "font-medium"
																: ""
														}
													>
														{option.label}
													</span>
												</label>
											))}
										</div>
										{errors.availability && (
											<p className="mt-1 text-sm text-red-600 flex items-center">
												<AlertTriangle className="h-4 w-4 mr-1" />
												{errors.availability}
											</p>
										)}
									</div>
								)}
							</div>
						</div>
					)}

					{/* Step 2: Images */}
					{currentStep === 2 && (
						<div className="space-y-6 animate-fade-in">
							<div className="text-center">
								<p className="text-gray-600 mb-6">
									Adaugă până la 5 fotografii de calitate pentru a atrage mai
									mulți cumpărători
								</p>
							</div>

							{errors.images && (
								<div className="bg-red-50 border border-red-200 rounded-lg p-4">
									<p className="text-red-600 flex items-center">
										<AlertTriangle className="h-4 w-4 mr-2" />
										{errors.images}
									</p>
								</div>
							)}

							<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
								{images.map((image, index) => (
									<div key={index} className="relative group">
										<img
											src={image}
											alt={`Upload ${index + 1}`}
											className="w-full h-48 object-cover rounded-lg"
										/>
										<button
											onClick={() => removeImage(index)}
											className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
										>
											<X className="h-4 w-4" />
										</button>
										{index === 0 && (
											<div className="absolute bottom-2 left-2 bg-gray-900 text-white px-2 py-1 rounded text-xs font-semibold">
												Foto principală
											</div>
										)}
									</div>
								))}

								{images.length < 5 && (
									<label className="border-2 border-dashed border-gray-300 rounded-lg h-48 flex flex-col items-center justify-center cursor-pointer hover:border-gray-900 transition-colors">
										<Camera className="h-8 w-8 text-gray-400 mb-2" />
										<span className="text-gray-600">Adaugă fotografie</span>
										<span className="text-sm text-gray-400">
											({images.length}/5)
										</span>
										<input
											type="file"
											multiple
											accept="image/*"
											onChange={handleImageUpload}
											className="hidden"
										/>
									</label>
								)}
							</div>

							<div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
								<h4 className="font-semibold text-blue-800 mb-2">
									Sfaturi pentru fotografii de calitate:
								</h4>
								<ul className="text-sm text-blue-700 space-y-1">
									<li>• Fotografiază în lumină naturală</li>
									<li>• Include imagini din toate unghiurile</li>
									<li>• Arată detaliile importante și eventualele defecte</li>
									<li>• Prima fotografie va fi cea principală</li>
									<li>• Limită de 5MB per imagine</li>
									<li>• Maxim 5 imagini per anunț</li>
								</ul>
							</div>
						</div>
					)}

					{/* Step 3: Description and Price */}
					{currentStep === 3 &&
						(window.scrollTo(0, 0),
						(
							<div className="space-y-6 animate-fade-in">
								<div>
									<label className="block text-sm font-medium text-gray-700 mb-2">
										Preț (EUR) *
									</label>
									<input
										type="number"
										value={formData.price}
										onChange={(e) => handleInputChange("price", e.target.value)}
										className={`w-full border rounded-lg px-4 py-3 focus:ring-2 focus:ring-gray-900 focus:border-transparent text-2xl font-bold ${
											errors.price ? "border-red-500" : "border-gray-300"
										}`}
										placeholder="18500"
										min="100"
										max="1000000"
									/>
									{errors.price && (
										<p className="mt-1 text-sm text-red-600 flex items-center">
											<AlertTriangle className="h-4 w-4 mr-1" />
											{errors.price}
										</p>
									)}
								</div>

								<div>
									<label className="block text-sm font-medium text-gray-700 mb-2">
										Descriere detaliată
									</label>
									<textarea
										value={formData.description}
										onChange={(e) =>
											handleInputChange("description", e.target.value)
										}
										rows={8}
										className={`w-full border rounded-lg px-4 py-3 focus:ring-2 focus:ring-gray-900 focus:border-transparent ${
											errors.description ? "border-red-500" : "border-gray-300"
										}`}
										placeholder="Descrie motocicleta în detaliu: starea tehnică, istoricul, modificările, etc."
									/>
									<div className="flex justify-between items-center mt-1">
										{errors.description ? (
											<p className="mt-1 text-sm text-red-600 flex items-center">
												<AlertTriangle className="h-4 w-4 mr-1" />
												{errors.description}
											</p>
										) : (
											<p className="text-sm text-gray-500">
												Maxim 2000 caractere
											</p>
										)}
										<span
											className={`text-sm ${
												formData.description.length > 2000
													? "text-red-600"
													: "text-green-600"
											}`}
										>
											{formData.description.length}/2000
										</span>
									</div>
								</div>

								<div>
									<label className="block text-sm font-medium text-gray-700 mb-4">
										Dotări și caracteristici
									</label>
									<div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
										{availableFeatures.map((feature) => (
											<label
												key={feature}
												className="flex items-center space-x-2 cursor-pointer"
											>
												<input
													type="checkbox"
													checked={formData.features.includes(feature)}
													onChange={() => handleFeatureToggle(feature)}
													className="rounded border-gray-300 text-gray-900 focus:ring-gray-900"
												/>
												<span className="text-sm">{feature}</span>
											</label>
										))}
									</div>
								</div>
							</div>
						))}

					{/* Step 4: Contact */}
					{currentStep === 4 && (
						<div className="space-y-6 animate-fade-in">
							<div className="text-center mb-6">
								<h3 className="text-xl font-semibold text-gray-900 mb-2">
									Informații de contact
								</h3>
								<p className="text-gray-600">
									Aceste informații vor fi vizibile cumpărătorilor interesați
								</p>
							</div>

							<div className="grid grid-cols-1 md:grid-cols-2 gap-6">
								<div>
									<label className="block text-sm font-medium text-gray-700 mb-2">
										Număr de telefon *
									</label>
									<input
										type="tel"
										value={formData.phone}
										onChange={(e) => handleInputChange("phone", e.target.value)}
										className={`w-full border rounded-lg px-4 py-3 focus:ring-2 focus:ring-gray-900 focus:border-transparent ${
											errors.phone ? "border-red-500" : "border-gray-300"
										}`}
										placeholder="0790 45 46 47"
									/>
									{errors.phone && (
										<p className="mt-1 text-sm text-red-600 flex items-center">
											<AlertTriangle className="h-4 w-4 mr-1" />
											{errors.phone}
										</p>
									)}
								</div>

								<div>
									<label className="block text-sm font-medium text-gray-700 mb-2">
										Email *
									</label>
									<input
										type="email"
										value={formData.email}
										onChange={(e) => handleInputChange("email", e.target.value)}
										className={`w-full border rounded-lg px-4 py-3 focus:ring-2 focus:ring-gray-900 focus:border-transparent ${
											errors.email ? "border-red-500" : "border-gray-300"
										}`}
										placeholder="contact@exemplu.com"
									/>
									{errors.email && (
										<p className="mt-1 text-sm text-red-600 flex items-center">
											<AlertTriangle className="h-4 w-4 mr-1" />
											{errors.email}
										</p>
									)}
								</div>
							</div>

							<div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6">
								<h4 className="font-semibold text-yellow-800 mb-4">
									Notă importantă:
								</h4>
								<p className="text-yellow-700 mb-3">
									Anunțul tău va fi trimis spre aprobare administratorilor
									platformei. După verificare, acesta va fi publicat și va
									deveni vizibil pentru toți utilizatorii.
								</p>
								<p className="text-yellow-700">
									Vei putea vedea statusul anunțului tău în secțiunea
									"Anunțurile Mele" din profilul tău.
								</p>
							</div>

							<div className="bg-green-50 border border-green-200 rounded-lg p-6">
								<h4 className="font-semibold text-green-800 mb-4">
									Rezumat anunț:
								</h4>
								<div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
									<div>
										<span className="text-green-700 font-medium">Titlu:</span>
										<span className="ml-2">
											{formData.title || "Necompletat"}
										</span>
									</div>
									<div>
										<span className="text-green-700 font-medium">Preț:</span>
										<span className="ml-2">€{formData.price || "0"}</span>
									</div>
									<div>
										<span className="text-green-700 font-medium">
											Tip vânzător:
										</span>
										<span className="ml-2">
											{userProfile.seller_type === "dealer"
												? "Dealer Verificat"
												: "Vânzător Privat"}
										</span>
									</div>
									<div>
										<span className="text-green-700 font-medium">
											Fotografii:
										</span>
										<span className="ml-2">{images.length}/5</span>
									</div>
									{userProfile.seller_type === "dealer" && (
										<div>
											<span className="text-green-700 font-medium">
												Disponibilitate:
											</span>
											<span className="ml-2">
												{formData.availability === "pe_stoc"
													? "Pe stoc"
													: "La comandă"}
											</span>
										</div>
									)}
								</div>
							</div>

							{errors.submit && (
								<div className="bg-red-50 border border-red-200 rounded-lg p-4">
									<p className="text-red-600 flex items-center">
										<AlertTriangle className="h-4 w-4 mr-2" />
										{errors.submit}
									</p>
								</div>
							)}
						</div>
					)}

					{/* Navigation Buttons */}
					<div className="flex justify-between pt-8 border-t border-gray-200">
						<button
							onClick={prevStep}
							disabled={currentStep === 1}
							className={`px-6 py-3 rounded-xl font-semibold transition-colors ${
								currentStep === 1
									? "bg-gray-100 text-gray-400 cursor-not-allowed"
									: "bg-gray-200 text-gray-700 hover:bg-gray-300"
							}`}
						>
							Înapoi
						</button>

						{currentStep < 4 ? (
							<button
								onClick={nextStep}
								className="px-6 py-3 bg-gray-900 text-white rounded-xl font-semibold hover:bg-gray-800 transition-colors"
							>
								Continuă
							</button>
						) : (
							<button
								onClick={handleSubmit}
								disabled={isSubmitting}
								className="px-8 py-3 bg-gray-900 text-white rounded-xl font-semibold hover:bg-gray-800 transition-colors flex items-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
							>
								{isSubmitting ? (
									<>
										<div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
										<span>Se trimite...</span>
									</>
								) : (
									<>
										<span>Trimite spre aprobare</span>
										<Check className="h-5 w-5" />
									</>
								)}
							</button>
						)}
					</div>
				</div>
			</div>

			{/* Success Modal */}
			<SuccessModal
				isOpen={showSuccessModal}
				onClose={handleSuccessModalClose}
				onGoHome={handleGoHome}
				onViewListing={handleViewListing}
				title="Anunț trimis spre aprobare!"
				message="Anunțul tău a fost trimis cu succes și este în așteptare pentru aprobare. Vei fi notificat când acesta va fi aprobat și publicat pe platformă."
				showViewButton={true}
			/>
		</div>
	);
};

export default CreateListingPage;