import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Progress } from "@/components/ui/progress";
import { Megaphone, Check, X, AlertCircle, Eye, EyeOff } from "lucide-react";
import { Link, useLocation, useSearch } from "wouter";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import apiClient from "@/lib/api-client";

export default function Register() {
  const [, setLocation] = useLocation();
  const searchParams = useSearch();
  const { toast } = useToast();

  // Form fields
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [username, setUsername] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [dateOfBirth, setDateOfBirth] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [referralCode, setReferralCode] = useState("");
  const [agreeToTerms, setAgreeToTerms] = useState(false);
  const [is18Plus, setIs18Plus] = useState(false);

  // UI states
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Validation states
  const [usernameAvailable, setUsernameAvailable] = useState<boolean | null>(null);
  const [usernameChecking, setUsernameChecking] = useState(false);
  const [emailValid, setEmailValid] = useState<boolean | null>(null);
  const [phoneValid, setPhoneValid] = useState<boolean | null>(null);
  const [ageValid, setAgeValid] = useState<boolean | null>(null);
  const [passwordStrength, setPasswordStrength] = useState(0);
  const [passwordRequirements, setPasswordRequirements] = useState({
    length: false,
    uppercase: false,
    lowercase: false,
    number: false,
    special: false,
  });

  // Auto-populate referral code from URL
  useEffect(() => {
    const urlParams = new URLSearchParams(searchParams);
    const refCode = urlParams.get("ref");
    if (refCode) {
      setReferralCode(refCode);
    }
  }, [searchParams]);

  // Username validation and availability check
  useEffect(() => {
    const checkUsername = async () => {
      if (username.length < 3) {
        setUsernameAvailable(null);
        return;
      }

      // Validate format
      const usernameRegex = /^[a-zA-Z0-9_-]{3,20}$/;
      if (!usernameRegex.test(username)) {
        setUsernameAvailable(false);
        return;
      }

      setUsernameChecking(true);

      try {
        const res = await fetch(`/api/v1/auth/check-username/${encodeURIComponent(username)}`);
        if (res.ok) {
          const data = await res.json();
          setUsernameAvailable(data.available);
        } else {
          setUsernameAvailable(null);
        }
      } catch {
        setUsernameAvailable(null);
      } finally {
        setUsernameChecking(false);
      }
    };

    const debounce = setTimeout(checkUsername, 300);
    return () => clearTimeout(debounce);
  }, [username]);

  // Email validation
  useEffect(() => {
    if (email.length === 0) {
      setEmailValid(null);
      return;
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    setEmailValid(emailRegex.test(email));
  }, [email]);

  // Ethiopian phone number validation
  useEffect(() => {
    if (phoneNumber.length === 0) {
      setPhoneValid(null);
      return;
    }
    // Ethiopian phone format: +251 followed by 9 digits
    const phoneRegex = /^\+251[0-9]{9}$/;
    setPhoneValid(phoneRegex.test(phoneNumber));
  }, [phoneNumber]);

  // Age validation from date of birth
  useEffect(() => {
    if (!dateOfBirth) {
      setAgeValid(null);
      return;
    }

    const birthDate = new Date(dateOfBirth);
    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();

    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }

    setAgeValid(age >= 18);
  }, [dateOfBirth]);

  // Password strength checker
  useEffect(() => {
    const requirements = {
      length: password.length >= 8,
      uppercase: /[A-Z]/.test(password),
      lowercase: /[a-z]/.test(password),
      number: /[0-9]/.test(password),
      special: /[!@#$%^&*(),.?":{}|<>]/.test(password),
    };

    setPasswordRequirements(requirements);

    const strength = Object.values(requirements).filter(Boolean).length;
    setPasswordStrength((strength / 5) * 100);
  }, [password]);

  const getPasswordStrengthLabel = () => {
    if (passwordStrength === 0) return { text: "", color: "" };
    if (passwordStrength <= 40) return { text: "Weak", color: "text-destructive" };
    if (passwordStrength <= 60) return { text: "Fair", color: "text-orange-500" };
    if (passwordStrength <= 80) return { text: "Good", color: "text-yellow-500" };
    return { text: "Strong", color: "text-chart-2" };
  };

  const validateName = (name: string) => {
    // No numbers or special characters in names
    const nameRegex = /^[a-zA-Z\s'-]+$/;
    return nameRegex.test(name) || name === "";
  };

  const calculateAge = (dob: string): number => {
    const birthDate = new Date(dob);
    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();

    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }

    return age;
  };

  const [isLoading, setIsLoading] = useState(false);

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateName(firstName) || !validateName(lastName)) {
      toast({
        title: "Invalid name",
        description: "Names should not contain numbers or special characters",
        variant: "destructive",
      });
      return;
    }

    if (usernameAvailable === false) {
      toast({
        title: "Username unavailable",
        description: "Please choose a different username",
        variant: "destructive",
      });
      return;
    }

    if (emailValid === false) {
      toast({
        title: "Invalid email",
        description: "Please enter a valid email address",
        variant: "destructive",
      });
      return;
    }

    if (phoneValid === false) {
      toast({
        title: "Invalid phone number",
        description: "Please enter a valid Ethiopian phone number (+251...)",
        variant: "destructive",
      });
      return;
    }

    if (password !== confirmPassword) {
      toast({
        title: "Passwords don't match",
        description: "Please ensure both passwords are identical",
        variant: "destructive",
      });
      return;
    }

    if (passwordStrength < 60) {
      toast({
        title: "Weak password",
        description: "Please choose a stronger password",
        variant: "destructive",
      });
      return;
    }

    if (!agreeToTerms) {
      toast({
        title: "Terms required",
        description: "You must agree to the Terms of Service and Privacy Policy",
        variant: "destructive",
      });
      return;
    }

    if (!is18Plus) {
      if (!dateOfBirth) {
        toast({
          title: "Age verification required",
          description: "Please confirm you are 18+ or provide your date of birth",
          variant: "destructive",
        });
        return;
      }

      const age = calculateAge(dateOfBirth);
      if (age < 18) {
        toast({
          title: "Age requirement not met",
          description: "You must be 18 years or older to create an account",
          variant: "destructive",
        });
        return;
      }
    }

    setIsLoading(true);

    try {
      const data = await apiClient.post(
        "/v1/auth/register",
        {
          firstName,
          lastName,
          email,
          username,
          phoneNumber,
          dateOfBirth,
          password,
          referralCode,
        },
        {
          credentials: "include",
          showErrorToast: false,
        }
      );

      localStorage.setItem("currentUser", JSON.stringify(data.user));

      toast({
        title: "Account created!",
        description: `Welcome to AdConnect, ${firstName}! Your account has been created successfully.`,
      });

      setLocation("/dashboard");
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to create account",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const strengthLabel = getPasswordStrengthLabel();

  return (
    <div className="min-h-screen flex items-center justify-center p-6 bg-muted/30">
      <Card className="w-full max-w-2xl">
        <CardHeader className="text-center space-y-4">
          <div className="flex items-center justify-center gap-2">
            <div className="h-10 w-10 rounded-lg bg-primary flex items-center justify-center">
              <Megaphone className="h-6 w-6 text-primary-foreground" />
            </div>
            <h1 className="text-2xl font-bold">AdConnect</h1>
          </div>
          <div>
            <CardTitle className="text-2xl">Create Account</CardTitle>
            <CardDescription>Join thousands earning and advertising today</CardDescription>
          </div>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleRegister} className="space-y-5">
            {/* Name Fields */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="firstName">
                  First Name <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="firstName"
                  type="text"
                  placeholder="John"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  required
                  data-testid="input-firstname"
                  className={cn(firstName && !validateName(firstName) && "border-destructive")}
                />
                {firstName && !validateName(firstName) && (
                  <p className="text-xs text-destructive flex items-center gap-1">
                    <AlertCircle className="h-3 w-3" />
                    No numbers or special characters
                  </p>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="lastName">
                  Last Name <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="lastName"
                  type="text"
                  placeholder="Doe"
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  required
                  data-testid="input-lastname"
                  className={cn(lastName && !validateName(lastName) && "border-destructive")}
                />
                {lastName && !validateName(lastName) && (
                  <p className="text-xs text-destructive flex items-center gap-1">
                    <AlertCircle className="h-3 w-3" />
                    No numbers or special characters
                  </p>
                )}
              </div>
            </div>

            {/* Username with availability checker */}
            <div className="space-y-2">
              <Label htmlFor="username">
                Username <span className="text-destructive">*</span>
              </Label>
              <div className="relative">
                <Input
                  id="username"
                  type="text"
                  placeholder="carlos_eth"
                  value={username}
                  onChange={(e) => setUsername(e.target.value.toLowerCase())}
                  required
                  data-testid="input-username"
                  className={cn(
                    username.length >= 3 && usernameAvailable === false && "border-destructive",
                    username.length >= 3 && usernameAvailable === true && "border-chart-2"
                  )}
                />
                {username.length >= 3 && (
                  <div className="absolute right-3 top-1/2 -translate-y-1/2">
                    {usernameChecking ? (
                      <div className="h-4 w-4 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                    ) : usernameAvailable === true ? (
                      <Check
                        className="h-5 w-5 text-chart-2"
                        data-testid="icon-username-available"
                      />
                    ) : usernameAvailable === false ? (
                      <X
                        className="h-5 w-5 text-destructive"
                        data-testid="icon-username-unavailable"
                      />
                    ) : null}
                  </div>
                )}
              </div>
              <p className="text-xs text-muted-foreground">
                3-20 characters, alphanumeric + underscore/hyphen only. Cannot be changed later.
              </p>
              {username.length >= 3 && usernameAvailable === false && (
                <p className="text-xs text-destructive flex items-center gap-1">
                  <AlertCircle className="h-3 w-3" />
                  Username is already taken
                </p>
              )}
              {username.length >= 3 && usernameAvailable === true && (
                <p className="text-xs text-chart-2 flex items-center gap-1">
                  <Check className="h-3 w-3" />
                  Username is available!
                </p>
              )}
            </div>

            {/* Email */}
            <div className="space-y-2">
              <Label htmlFor="email">
                Email Address <span className="text-destructive">*</span>
              </Label>
              <div className="relative">
                <Input
                  id="email"
                  type="email"
                  placeholder="john@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  data-testid="input-email"
                  className={cn(
                    email && emailValid === false && "border-destructive",
                    email && emailValid === true && "border-chart-2"
                  )}
                />
                {email && emailValid !== null && (
                  <div className="absolute right-3 top-1/2 -translate-y-1/2">
                    {emailValid ? (
                      <Check className="h-5 w-5 text-chart-2" data-testid="icon-email-valid" />
                    ) : (
                      <X className="h-5 w-5 text-destructive" data-testid="icon-email-invalid" />
                    )}
                  </div>
                )}
              </div>
              <p className="text-xs text-muted-foreground">Primary contact and login credential</p>
            </div>

            {/* Phone Number */}
            <div className="space-y-2">
              <Label htmlFor="phoneNumber">
                Phone Number <span className="text-destructive">*</span>
              </Label>
              <div className="relative">
                <Input
                  id="phoneNumber"
                  type="tel"
                  placeholder="+251912345678"
                  value={phoneNumber}
                  onChange={(e) => setPhoneNumber(e.target.value)}
                  required
                  data-testid="input-phone-number"
                  className={cn(
                    phoneNumber && phoneValid === false && "border-destructive",
                    phoneNumber && phoneValid === true && "border-chart-2"
                  )}
                />
                {phoneNumber && phoneValid !== null && (
                  <div className="absolute right-3 top-1/2 -translate-y-1/2">
                    {phoneValid ? (
                      <Check className="h-5 w-5 text-chart-2" data-testid="icon-phone-valid" />
                    ) : (
                      <X className="h-5 w-5 text-destructive" data-testid="icon-phone-invalid" />
                    )}
                  </div>
                )}
              </div>
              <p className="text-xs text-muted-foreground">
                Ethiopian format (+251...). Used for 2FA and KYC verification.
              </p>
            </div>

            {/* Password with strength meter */}
            <div className="space-y-2">
              <Label htmlFor="password">
                Password <span className="text-destructive">*</span>
              </Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  data-testid="input-password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  data-testid="button-toggle-password"
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
              {password && (
                <>
                  <div className="space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-muted-foreground">Password strength</span>
                      <span className={cn("text-xs font-medium", strengthLabel.color)}>
                        {strengthLabel.text}
                      </span>
                    </div>
                    <Progress
                      value={passwordStrength}
                      className="h-2"
                      data-testid="progress-password-strength"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-xs">
                    <div
                      className={cn(
                        "flex items-center gap-1",
                        passwordRequirements.length ? "text-chart-2" : "text-muted-foreground"
                      )}
                    >
                      {passwordRequirements.length ? (
                        <Check className="h-3 w-3" />
                      ) : (
                        <X className="h-3 w-3" />
                      )}
                      At least 8 characters
                    </div>
                    <div
                      className={cn(
                        "flex items-center gap-1",
                        passwordRequirements.uppercase ? "text-chart-2" : "text-muted-foreground"
                      )}
                    >
                      {passwordRequirements.uppercase ? (
                        <Check className="h-3 w-3" />
                      ) : (
                        <X className="h-3 w-3" />
                      )}
                      Uppercase letter
                    </div>
                    <div
                      className={cn(
                        "flex items-center gap-1",
                        passwordRequirements.lowercase ? "text-chart-2" : "text-muted-foreground"
                      )}
                    >
                      {passwordRequirements.lowercase ? (
                        <Check className="h-3 w-3" />
                      ) : (
                        <X className="h-3 w-3" />
                      )}
                      Lowercase letter
                    </div>
                    <div
                      className={cn(
                        "flex items-center gap-1",
                        passwordRequirements.number ? "text-chart-2" : "text-muted-foreground"
                      )}
                    >
                      {passwordRequirements.number ? (
                        <Check className="h-3 w-3" />
                      ) : (
                        <X className="h-3 w-3" />
                      )}
                      Number
                    </div>
                    <div
                      className={cn(
                        "flex items-center gap-1",
                        passwordRequirements.special ? "text-chart-2" : "text-muted-foreground"
                      )}
                    >
                      {passwordRequirements.special ? (
                        <Check className="h-3 w-3" />
                      ) : (
                        <X className="h-3 w-3" />
                      )}
                      Special character
                    </div>
                  </div>
                </>
              )}
            </div>

            {/* Confirm Password */}
            <div className="space-y-2">
              <Label htmlFor="confirmPassword">
                Confirm Password <span className="text-destructive">*</span>
              </Label>
              <div className="relative">
                <Input
                  id="confirmPassword"
                  type={showConfirmPassword ? "text" : "password"}
                  placeholder="••••••••"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                  data-testid="input-confirm-password"
                  className={cn(
                    confirmPassword && password !== confirmPassword && "border-destructive"
                  )}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  data-testid="button-toggle-confirm-password"
                >
                  {showConfirmPassword ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </button>
              </div>
              {confirmPassword && password !== confirmPassword && (
                <p className="text-xs text-destructive flex items-center gap-1">
                  <AlertCircle className="h-3 w-3" />
                  Passwords do not match
                </p>
              )}
            </div>

            {/* Age Verification */}
            <div className="space-y-3">
              <Label>
                Age Verification <span className="text-destructive">*</span>
              </Label>
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="is18Plus"
                  checked={is18Plus}
                  onCheckedChange={(checked) => setIs18Plus(checked as boolean)}
                  data-testid="checkbox-18plus"
                />
                <label
                  htmlFor="is18Plus"
                  className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                >
                  I am 18 years or older
                </label>
              </div>
              <div className="space-y-2">
                <Label htmlFor="dateOfBirth" className="text-muted-foreground">
                  Or provide Date of Birth (Optional)
                </Label>
                <div className="relative">
                  <Input
                    id="dateOfBirth"
                    type="date"
                    value={dateOfBirth}
                    onChange={(e) => setDateOfBirth(e.target.value)}
                    data-testid="input-date-of-birth"
                    className={cn(
                      dateOfBirth && ageValid === false && "border-destructive",
                      dateOfBirth && ageValid === true && "border-chart-2"
                    )}
                  />
                  {dateOfBirth && ageValid !== null && (
                    <div className="absolute right-3 top-1/2 -translate-y-1/2">
                      {ageValid ? (
                        <Check className="h-5 w-5 text-chart-2" data-testid="icon-age-valid" />
                      ) : (
                        <X className="h-5 w-5 text-destructive" data-testid="icon-age-invalid" />
                      )}
                    </div>
                  )}
                </div>
                {dateOfBirth && ageValid === false && (
                  <p className="text-xs text-destructive flex items-center gap-1">
                    <AlertCircle className="h-3 w-3" />
                    You must be 18 years or older to create an account
                  </p>
                )}
                {dateOfBirth && ageValid === true && (
                  <p className="text-xs text-chart-2 flex items-center gap-1">
                    <Check className="h-3 w-3" />
                    Age verification confirmed
                  </p>
                )}
              </div>
            </div>

            {/* Referral Code */}
            <div className="space-y-2">
              <Label htmlFor="referralCode">Referral Code (Optional)</Label>
              <Input
                id="referralCode"
                type="text"
                placeholder="Enter referral code"
                value={referralCode}
                onChange={(e) => setReferralCode(e.target.value)}
                data-testid="input-referral-code"
              />
              <p className="text-xs text-muted-foreground">
                Have a referral code? Enter it to get bonus rewards!
              </p>
            </div>

            {/* Terms & Conditions */}
            <div className="flex items-start space-x-2">
              <Checkbox
                id="agreeToTerms"
                checked={agreeToTerms}
                onCheckedChange={(checked) => setAgreeToTerms(checked as boolean)}
                data-testid="checkbox-terms"
              />
              <label
                htmlFor="agreeToTerms"
                className="text-sm leading-relaxed peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
              >
                I agree to the{" "}
                <Link href="/terms-of-service">
                  <span className="text-primary hover:underline cursor-pointer">
                    Terms of Service
                  </span>
                </Link>{" "}
                and{" "}
                <Link href="/privacy-policy">
                  <span className="text-primary hover:underline cursor-pointer">
                    Privacy Policy
                  </span>
                </Link>
                <span className="text-destructive ml-1">*</span>
              </label>
            </div>

            <Button
              type="submit"
              className="w-full h-12 text-base font-medium"
              data-testid="button-register"
              disabled={isLoading}
            >
              {isLoading ? "Creating Account..." : "Create Account"}
            </Button>
          </form>
          <div className="mt-6 text-center text-sm">
            <span className="text-muted-foreground">Already have an account? </span>
            <Link href="/signin">
              <Button variant="ghost" className="px-1 h-auto" data-testid="link-signin">
                Sign in
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
