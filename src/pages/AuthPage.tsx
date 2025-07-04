ve">
										<input
											type="text"
											value={formData.location}
											onChange={(e) => handleLocationChange(e.target.value)}
											onFocus={() => {
												if (formData.location.length > 0) {
													const filtered = romanianCities
														.filter((city) =>
															city
																.toLowerCase()
																.includes(formData.location.toLowerCase()),
														)
														.slice(0, 10);
													setFilteredCities(filtered);
													setShowLocationDropdown(true);
												}
											}}
											onBlur={() => {
												// Delay pentru a permite click-ul pe opțiuni
												setTimeout(() => setShowLocationDropdown(false), 200);
											}}
											className={`w-full pl-10 sm:pl-12 pr-10 py-2.5 sm:py-3 border rounded-xl focus:ring-2 focus:ring-nexar-accent focus:border-transparent transition-colors text-sm sm:text-base ${
												validationErrors.location
													? "border-red-500"
													: "border-gray-300"
											}`}
											placeholder="Începe să scrii orașul..."
											required={
												!isLogin && !isResetPassword && !isPasswordReset
											}
											autoComplete="off"
										/>
										<MapPin className="absolute left-3 sm:left-4 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4 sm:h-5 sm:w-5" />
										<ChevronDown className="absolute right-3 sm:right-4 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4 sm:h-5 sm:w-5" />

										{/* Dropdown cu orașe */}
										{showLocationDropdown && filteredCities.length > 0 && (
											<div className="absolute z-50 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-60 overflow-y-auto">
												{filteredCities.map((city, index) => (
													<button
														key={index}
														type="button"
														onClick={() => selectCity(city)}
														className="w-full text-left px-4 py-2 hover:bg-nexar-accent hover:text-white transition-colors text-sm border-b border-gray-100 last:border-b-0"
													>
														{city}
													</button>
												))}
											</div>
										)}
									</div>
									{validationErrors.location && (
										<p className="mt-1 text-sm text-red-600 flex items-center">
											<AlertTriangle className="h-4 w-4 mr-1" />
											{validationErrors.location}
										</p>
									)}
								</div>

								<div>
									<label className="block text-sm font-medium text-gray-700 mb-2">
										Tip Vânzător *
									</label>
									<div className="relative">
										<select
											value={formData.sellerType}
											onChange={(e) =>
												handleInputChange("sellerType", e.target.value)
											}
											className="w-full pl-10 sm:pl-12 pr-4 py-2.5 sm:py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-nexar-accent focus:border-transparent transition-colors appearance-none text-sm sm:text-base"
											required={
												!isLogin && !isResetPassword && !isPasswordReset
											}
										>
											<option value="individual">Vânzător Privat</option>
											<option value="dealer">Dealer Autorizat</option>
										</select>
										<Building className="absolute left-3 sm:left-4 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4 sm:h-5 sm:w-5" />
									</div>
								</div>
							</>
						)}

						{!isResetPassword && (
							<div>
								<label className="block text-sm font-medium text-gray-700 mb-2">
									Parolă *
								</label>
								<div className="relative">
									<input
										type={showPassword ? "text" : "password"}
										value={formData.password}
										onChange={(e) =>
											handleInputChange("password", e.target.value)
										}
										className={`w-full pl-10 sm:pl-12 pr-10 sm:pr-12 py-2.5 sm:py-3 border rounded-xl focus:ring-2 focus:ring-nexar-accent focus:border-transparent transition-colors text-sm sm:text-base ${
											validationErrors.password
												? "border-red-500"
												: "border-gray-300"
										}`}
										placeholder="••••••••"
										required
									/>
									<Lock className="absolute left-3 sm:left-4 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4 sm:h-5 sm:w-5" />
									<button
										type="button"
										onClick={() => setShowPassword(!showPassword)}
										className="absolute right-3 sm:right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
									>
										{showPassword ? (
											<EyeOff className="h-4 w-4 sm:h-5 sm:w-5" />
										) : (
											<Eye className="h-4 w-4 sm:h-5 sm:w-5" />
										)}
									</button>
								</div>
								{validationErrors.password && (
									<p className="mt-1 text-sm text-red-600 flex items-center">
										<AlertTriangle className="h-4 w-4 mr-1" />
										{validationErrors.password}
									</p>
								)}
							</div>
						)}

						{((!isLogin && !isResetPassword) || isPasswordReset) && (
							<div>
								<label className="block text-sm font-medium text-gray-700 mb-2">
									Confirmă parola *
								</label>
								<div className="relative">
									<input
										type="password"
										value={formData.confirmPassword}
										onChange={(e) =>
											handleInputChange("confirmPassword", e.target.value)
										}
										className={`w-full pl-10 sm:pl-12 pr-4 py-2.5 sm:py-3 border rounded-xl focus:ring-2 focus:ring-nexar-accent focus:border-transparent transition-colors text-sm sm:text-base ${
											validationErrors.confirmPassword
												? "border-red-500"
												: "border-gray-300"
										}`}
										placeholder="••••••••"
										required={(!isLogin && !isResetPassword) || isPasswordReset}
									/>
									<Lock className="absolute left-3 sm:left-4 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4 sm:h-5 sm:w-5" />
								</div>
								{validationErrors.confirmPassword && (
									<p className="mt-1 text-sm text-red-600 flex items-center">
										<AlertTriangle className="h-4 w-4 mr-1" />
										{validationErrors.confirmPassword}
									</p>
								)}
							</div>
						)}

						{isLogin && !isResetPassword && !isPasswordReset && (
							<div className="flex items-center justify-between">
								<label className="flex items-center">
									<input
										type="checkbox"
										className="rounded border-gray-300 text-nexar-accent focus:ring-nexar-accent"
									/>
									<span className="ml-2 text-sm text-gray-600">
										Ține-mă conectat
									</span>
								</label>
								<button
									type="button"
									onClick={() => {
										setIsResetPassword(true);
										setError("");
										setSuccessMessage("");
									}}
									className="text-sm text-nexar-accent hover:text-nexar-gold transition-colors"
								>
									Ai uitat parola?
								</button>
							</div>
						)}

						{!isLogin && !isResetPassword && !isPasswordReset && (
							<div className="flex items-start space-x-3">
								<input
									type="checkbox"
									checked={formData.agreeToTerms}
									onChange={(e) =>
										handleInputChange("agreeToTerms", e.target.checked)
									}
									className="mt-1 rounded border-gray-300 text-nexar-accent focus:ring-nexar-accent"
									required={!isLogin && !isResetPassword && !isPasswordReset}
								/>
								<span className="text-sm text-gray-600">
									Sunt de acord cu{" "}
									<Link
										to="/termeni"
										target="_blank"
										className="text-nexar-accent hover:text-nexar-gold transition-colors"
									>
										Termenii și Condițiile
									</Link>{" "}
									și{" "}
									<Link
										to="/confidentialitate"
										target="_blank"
										className="text-nexar-accent hover:text-nexar-gold transition-colors"
									>
										Politica de Confidențialitate
									</Link>
								</span>
								{validationErrors.agreeToTerms && (
									<p className="text-sm text-red-600 flex items-center">
										<AlertTriangle className="h-4 w-4 mr-1" />
										{validationErrors.agreeToTerms}
									</p>
								)}
							</div>
						)}

						<button
							type="submit"
							disabled={isLoading || isValidating}
							className="w-full bg-nexar-accent text-white py-2.5 sm:py-3 rounded-xl font-semibold hover:bg-nexar-gold transition-colors transform hover:scale-105 duration-200 disabled:opacity-50 disabled:cursor-not-allowed text-sm sm:text-base"
						>
							{isLoading
								? "Se procesează..."
								: isPasswordReset
								? "Setează noua parolă"
								: isResetPassword
								? "Trimite link de resetare"
								: isLogin
								? "Conectează-te"
								: "Creează Cont"}
						</button>
					</form>

					{/* Footer */}
					<div className="mt-6 sm:mt-8 text-center">
						{isResetPassword || isPasswordReset ? (
							<p className="text-sm text-gray-600">
								Ți-ai amintit parola?{" "}
								<button
									onClick={() => {
										setIsResetPassword(false);
										setIsPasswordReset(false);
										setIsLogin(true);
										setError("");
										setSuccessMessage("");
									}}
									className="text-nexar-accent hover:text-nexar-gold font-semibold transition-colors"
								>
									Înapoi la conectare
								</button>
							</p>
						) : (
							<p className="text-sm text-gray-600">
								{isLogin ? "Nu ai cont?" : "Ai deja cont?"}{" "}
								<button
									onClick={() => {
										setIsLogin(!isLogin);
										setValidationErrors({});
										setError("");
										setSuccessMessage("");
									}}
									className="text-nexar-accent hover:text-nexar-gold font-semibold transition-colors"
								>
									{isLogin ? "Înregistrează-te aici" : "Conectează-te aici"}
								</button>
							</p>
						)}
					</div>
				</div>
			</div>
		</div>
	);
};

export default AuthPage;