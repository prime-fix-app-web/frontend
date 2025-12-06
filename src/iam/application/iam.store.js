import {IamApi} from "@/iam/infrastructure/iam-api.js";
import {AuthApi} from "@/iam/infrastructure/auth-api.js";
import {defineStore} from "pinia";
import {computed, ref} from "vue";
import {UserAccountAssembler} from "@/iam/infrastructure/user-account.assembler.js";
import {UserAssembler} from "@/iam/infrastructure/user.assembler.js";
import {User} from "@/iam/domain/model/user.entity.js";
import {UserAccount} from "@/iam/domain/model/user-account.entity.js";
import {Location} from "@/auto-repair-catalog/domain/model/location.entity.js";
import {LocationAssembler} from "@/auto-repair-catalog/infrastructure/location.assembler.js";
import {Payment} from "@/payment-service/domain/model/payment.entity.js";
import {PaymentAssembler} from "@/payment-service/infrastructure/payment.assembler.js";
import {apiConfig} from "@/shared/infrastructure/http/api-config.js";

import useCatalogStore from "@/auto-repair-catalog/application/owner.store.js";
import usePaymentStore from "@/payment-service/application/payment-service.store.js";

import {MembershipChoice} from "@/data-collection-diagnosis/domain/types/membership-choice.js";
import {RoleChoicesType} from "@/data-collection-diagnosis/domain/types/role-choice.js";

const VEHICLE_OWNER_ROLE_ID = 1;
const WORKSHOP_ROLE_ID = 2;

/**
 * Check if there is an active JWT token in storage
 * @returns {boolean} - true if JWT token exists
 */
function hasActiveJWT() {
    const token = localStorage.getItem('authToken') || sessionStorage.getItem('authToken');
    return !!token;
}

/**
 * IAM API instance
 * @type {IamApi} - Instance of the IAM API for making requests
 */
const iamApi = new IamApi();

/**
 * Auth API instance (for AWS authentication with JWT)
 * @type {AuthApi} - Instance of the Auth API for sign-in/sign-up
 */
const authApi = new AuthApi();

/**
 *
 * IAM Store - Manages user authentication, registration, and session state.
 */
export const useIamStore = defineStore('iam', () => {
    /**
     *  Catalog store
     * @type {import('@/payment-service/application/payment-service.store').useCatalogStore}
     */
    const catalogStore = useCatalogStore();

    /**
     * Payment store
     * @type {import('@/payment-service/application/payment-service.store').usePaymentStore}
     * */
    const paymentStore = usePaymentStore();

    /**
     * User accounts list
     * @type {import("vue").Ref<Array<UserAccount>>} - Array of user account entities
     */
    const userAccounts = ref([]);

    /**
     * Users list
     * @type {import("vue").Ref<Array<User>>} - Array of user entities
     */
    const users = ref([]);

    /**
     * Locations list
     * @type {import("vue").ComputedRef<Array<Location>>} - Array of location entities
     */
    const locations = computed(() => catalogStore.locations);

    /**
     * Payments list
     * @type {import("vue").ComputedRef<Array<Payment>>} - Array of payment entities
     */
    const payments = computed(() => paymentStore.payments);

    /**
     * Loading state
     * @type {import("vue").Ref<boolean>} - True if loading, false otherwise
     */
    const loading = ref(false);

    /**
     * Error messages
     * @type {import("vue").Ref<Array>} - Array of error messages
     */
    const errors = ref([]);

    /**
     * Current session user account
     * @type {import("vue").Ref<UserAccount|null>} - The user account entity
     */
    const sessionUserAccount = ref(null);

    /**
     * Current session user
     * @type {import("vue").Ref<User|null>} - The user entity
     */
    const sessionUser = ref(null);

    /**
     * Indicates if user accounts have been loaded
     * @type {import("vue").Ref<boolean>} - True if user accounts are loaded, false otherwise
     */
    const userAccountsLoaded =ref(false);

    /**
     * Indicates if users have been loaded
     * @type {import("vue").Ref<boolean>} - True if users are loaded, false otherwise
     */
    const userLoaded = ref(false);

    /**
     * Register user during registration flow
     * @type {import("vue").Ref<User|null>} - The user entity
     */
    const registerUser = ref(null);

    /**
     * Register user account during registration flow
     * @type {import("vue").Ref<UserAccount|null>} - The user account entity
     */
    const registerUserAccount = ref(null);

    /**
     * Register payment during registration flow
     * @type {import("vue").Ref<Payment|null>} - The payment entity
     */
    const registerPayment = ref(null);

    /**
     * Register role during registration flow
     * @type {import("vue").Ref<Role|null>} - The role ID
     */
    const registerRole = ref(null);

    /**
     * Register location during registration flow
     * @type {import("vue").Ref<Location|null>} - The location entity
     */
    const registerLocation = ref(null);

    /**
     * Register membership type during registration flow
     * @type {import("vue").Ref<MembershipChoice|null>} - The membership type ID
     */
    const registerMemberShipType = ref(null);

    /**
     * Get the count of user accounts
     * @type {import("vue").ComputedRef<number>} - The number of user accounts
     */
    const userAccountCount = computed(() => {
        return userAccountsLoaded ? userAccounts.value.length:0;
    })

    /**
     * Get the current session user ID
     * @type {import("vue").ComputedRef<number|null>} - The user ID or null if not logged in
     */
    const sessionUserId = computed(() => sessionUser.value.id ?? null);

    /**
     * Get the current session user account ID
     * @type {import("vue").ComputedRef<number|null>} - The user account ID or null if not logged in
     */
    const sessionUserAccountId = computed(() => sessionUserAccount.value.id ?? null);

    /**
     * Check if the given user ID matches the current session user ID
     * @param userId - The user ID to check
     * @returns {boolean} - True if it matches, false otherwise
     */
    function isCurrentUser(userId) {
        const current = sessionUserId.value;
        if (!current || !userId) return false;
        return Number(current) === Number(userId);
    }

    /**
     * Check if the given account ID matches the current session user account ID
     * @param accountId - The account ID to check
     * @returns {boolean} - True if it matches, false otherwise
     */
    function isCurrentUserAccount(accountId) {
        const current = sessionUserAccountId.value;
        if (!current || !accountId) return false;
        return Number(current) === Number(accountId);
    }


    /**
     * Get the count of users
     * @type {import("vue").ComputedRef<number>} - The number of users
     */
    const userCount = computed(() => {
        return userLoaded ? users.value.length:0;
    })

    /**
     * Get the count of payments
     * @type {import("vue").ComputedRef<number>} - The number of payments
     */
    const paymentCount = computed(() => {
        this.payments().length;
    })

    /**
     * Get the count of locations
     * @type {import("vue").ComputedRef<number>} - The number of locations
     */
    const locationCount = computed(() => {
        this.locations().length;
    })

    /**
     * Check if a user is authenticated
     * @type {import("vue").ComputedRef<boolean>} - True if authenticated, false otherwise
     */
    const isAuthenticated = computed(() => !!sessionUserAccount.value);

    /**
     * Get role ID of the session user account
     * @returns {string} - Role ID of the user account
     */
    const roleId = computed(() => sessionUserAccount.value.role_id ?? '');

    /**
     * Get full name of the session user
     * @returns {string} - Full name of the user
     */
    const fullName = computed(() => {
        const user = sessionUser.value;
        return user ? `${user.name} ${user.last_name}` : '';
    });

    /**
     * Format error messages for display
     * @param err - The error object
     * @param fallback - The fallback message if no specific message is found
     * @returns {string} - The formatted error message
     */
    function formatError(err, fallback) {
        if (err instanceof Error) {
            return err.message.includes('Resource not found') ? `${fallback}: No encontrado` : err.message;
        }
        const apiError = err?.response?.data?.message || err?.message;
        return apiError || fallback;
    }

    /**
     * Save session to local storage
     */
    function saveSessionToStorage() {
        if (typeof localStorage === 'undefined') return;

        try {
            const userAccount = sessionUserAccount.value;
            const user = sessionUser.value;

            // Validar que los datos son válidos antes de guardar
            if (!userAccount || !user) {
                console.warn('Cannot save session: Missing userAccount or user');
                return;
            }

            if (!userAccount.id || !user.id) {
                console.warn('Cannot save session: Invalid userAccount or user IDs');
                return;
            }

            // Crear una copia limpia de los datos para guardar
            const sessionData = {
                userAccount: {
                    id: userAccount.id,
                    username: userAccount.username,
                    email: userAccount.email,
                    password: userAccount.password,
                    role_id: userAccount.role_id,
                    user_id: userAccount.user_id,
                    membership_id: userAccount.membership_id,
                    is_new: userAccount.is_new
                },
                user: {
                    id: user.id,
                    name: user.name,
                    last_name: user.last_name,
                    dni: user.dni,
                    phone_number: user.phone_number,
                    location_id: user.location_id
                },
                timestamp: Date.now()
            };

            localStorage.setItem('prime-fix-session', JSON.stringify(sessionData));
            console.log('✅ Session saved to localStorage');
        } catch (err) {
            console.error('Failed to save session to localStorage:', err);
        }
    }

    /**
     * Clear session from local storage
     */
    function clearSessionStorage() {
        if (typeof localStorage === 'undefined') return;

        try {
            localStorage.removeItem('prime-fix-session');
            console.log('Session cleared from localStorage');
        } catch (err) {
            console.error('Failed to clear session from localStorage:', err);
        }
    }

    /**
     * Restore session from local storage
     */
    function restoreSessionFromStorage() {
        if (typeof localStorage === 'undefined') {
            console.warn("localStorage is not available in this environment.");
            return;
        }
        try {
            const sessionData = localStorage.getItem('prime-fix-session');
            if (!sessionData) {
                console.log('NOT LOGGED - No session found in localStorage');
                return;
            }

            const parsed = JSON.parse(sessionData);
            const {userAccount: rawUserAccount, user: rawUser, timestamp} = parsed;

            // Verificar que los datos existan
            if (!rawUserAccount || !rawUser) {
                console.error('NOT LOGGED - Invalid session data structure');
                clearSessionStorage();
                return;
            }

            // Validar los datos del UserAccount
            const isOwner = rawUserAccount.role_id === VEHICLE_OWNER_ROLE_ID;
            const isWorkshop = rawUserAccount.role_id === WORKSHOP_ROLE_ID;

            const hasValidUserAccount = rawUserAccount
                && typeof rawUserAccount.id === 'number'
                && typeof rawUserAccount.role_id === 'number'
                && (isOwner || isWorkshop)
                && (rawUserAccount.username || rawUserAccount.email);

            // Validar los datos del User
            const hasValidUser = rawUser
                && typeof rawUser.id === 'number'
                && typeof rawUser.name === 'string'
                && rawUser.name.length > 0;

            if (hasValidUserAccount && hasValidUser) {
                // Reconstruir las entidades
                const userAccount = new UserAccount(rawUserAccount);
                const user = new User(rawUser);

                sessionUserAccount.value = userAccount;
                sessionUser.value = user;

                // Log restored session details
                const roleName = isOwner ? RoleChoicesType.VEHICLE_OWNER : RoleChoicesType.AUTO_REPAIR_WORKSHOP;
                const sessionAge = timestamp ? Math.floor((Date.now() - timestamp) / 1000 / 60) : 'unknown';

                console.log(`✅ Session restored: User ${userAccount.username || userAccount.email || user.name || 'Unknown'} with role ${userAccount.role_id} (${roleName}) - Session age: ${sessionAge} minutes`);
            } else {
                console.error('NOT LOGGED - Corrupted session detected and cleared.');
                console.debug('UserAccount valid:', hasValidUserAccount, 'User valid:', hasValidUser);
                console.debug('Raw data:', { rawUserAccount, rawUser });
                clearSessionStorage();
            }
        } catch (err) {
            console.warn('NOT LOGGED - Failed to restore session from localStorage:', err);
            clearSessionStorage();
        }
    }

    /**
     * Fetch user accounts from the API and store them
     */
    function fetchUserAccounts() {
        // Si estamos usando AWS y no hay JWT, no hacer fetch
        if (apiConfig.isAwsPrimary && !hasActiveJWT()) {
            console.log('[IAM Store] Skipping fetchUserAccounts - No JWT token available');
            return Promise.resolve();
        }

        return iamApi.getUserAccounts().then(response =>{
            userAccounts.value = UserAccountAssembler.toEntitiesFromResponse(response);
            userAccountsLoaded.value = true;
        }).catch(error=>{
            console.error('[IAM Store] fetchUserAccounts error:', error);
            errors.value.push(error);
        });
    }

    /**
     * Fetch users from the API and store them
     */
    function fetchUsers() {
        // Si estamos usando AWS y no hay JWT, no hacer fetch
        if (apiConfig.isAwsPrimary && !hasActiveJWT()) {
            console.log('[IAM Store] Skipping fetchUsers - No JWT token available');
            return Promise.resolve();
        }

        return iamApi.getUsers().then(response =>{
            users.value = UserAssembler.toEntitiesFromResponse(response);
            userLoaded.value = true;
        }).catch(error=>{
            console.error('[IAM Store] fetchUsers error:', error);
            errors.value.push(error);
        });
    }

    /**
     * Login a user with username and password
     * Uses AWS AuthApi with JWT in production, fallback to Supabase manual validation
     * @param {string} username - The user's username
     * @param {string} password - The user's password
     * @returns {Promise<UserAccount>} - The logged-in user account
     */
    async function login(username, password) {
        loading.value = true;
        errors.value = [];

        try {
            // Intentar login con AWS (JWT)
            if (apiConfig.isAwsPrimary) {
                try {
                    console.log('[IAM Store] Attempting AWS login with JWT...');

                    const response = await authApi.signIn(username, password);

                    // Guardar JWT token
                    localStorage.setItem('authToken', response.token);
                    console.log('[IAM Store] JWT token saved:', response.token.substring(0, 20) + '...');

                    // Cargar datos del usuario desde AWS/Supabase
                    await fetchUserAccounts();
                    await fetchUsers();

                    // Buscar el usuario por ID retornado
                    const account = userAccounts.value.find(a => a.id === response.id);

                    if (!account) {
                        throw new Error("User account not found after login");
                    }

                    const user = users.value.find(u => u.id === account.user_id);

                    if (!user) {
                        throw new Error("User not found");
                    }

                    sessionUserAccount.value = account;
                    sessionUser.value = user;

                    saveSessionToStorage();
                    console.log('[IAM Store] AWS login successful');

                    return account;
                } catch (awsError) {
                    console.warn('[IAM Store] AWS login failed, trying Supabase fallback...', awsError.message);
                    // Limpiar cualquier token parcial
                    localStorage.removeItem('authToken');
                    sessionStorage.removeItem('authToken');
                    // Continúa al fallback de Supabase
                }
            }

            // Fallback: Login con Supabase (comparación manual)
            console.log('[IAM Store] Using Supabase manual validation...');

            // Hacer fetch directo sin verificar JWT (para el fallback)
            try {
                const userAccountsResponse = await iamApi.getUserAccounts();
                const tempUserAccounts = UserAccountAssembler.toEntitiesFromResponse(userAccountsResponse);

                const usersResponse = await iamApi.getUsers();
                const tempUsers = UserAssembler.toEntitiesFromResponse(usersResponse);

                // Buscar cuenta por username
                const account = tempUserAccounts.find(a =>
                    a.username?.toLowerCase().trim() === username.toLowerCase().trim()
                );

                if (!account) {
                    throw new Error("User or password incorrect");
                }

                // Validar password (comparación simple - Supabase no tiene hash)
                if (account.password.trim() !== password.trim()) {
                    throw new Error("User or password incorrect");
                }

                // Buscar usuario asociado
                const user = tempUsers.find(u => u.id === account.user_id);

                if (!user) {
                    throw new Error("User not found");
                }

                // Actualizar los stores con los datos cargados
                userAccounts.value = tempUserAccounts;
                userAccountsLoaded.value = true;
                users.value = tempUsers;
                userLoaded.value = true;

                sessionUserAccount.value = account;
                sessionUser.value = user;

                saveSessionToStorage();
                console.log('[IAM Store] Supabase login successful');

                return account;

            } catch (supabaseError) {
                console.error('[IAM Store] Supabase fallback failed:', supabaseError);
                throw new Error("User or password incorrect");
            }

        } catch (err) {
            errors.value.push(formatError(err, "Login failed"));
            throw err;
        } finally {
            loading.value = false;
        }
    }

    /**
     * Logout the current user and clear session data
     * Clears JWT token and session storage
     */
    function logout() {
        // Limpiar referencias en memoria
        sessionUserAccount.value = null;
        sessionUser.value = null;

        // Limpiar JWT token
        try {
            localStorage.removeItem('authToken');
            sessionStorage.removeItem('authToken');
        } catch (err) {
            console.warn('Failed to remove auth tokens:', err);
        }

        // Limpiar sesión
        clearSessionStorage();

        console.log('✅ Logout successful - All session data cleared');
    }

    /**
     * Get user by ID
     * @param id - The ID of the user
     * @returns {User} - The user entity if found, otherwise undefined
     */
    function getUserById(id) {
        return users.value.find(u => u.id === id);
    }

    /**
     * Get user account by ID
     * @param id - The ID of the user account
     * @returns {UserAccount} - The user account entity if found, otherwise undefined
     */
    function getUserAccountById(id) {
        return userAccounts.value.find(ua => ua.id === id);
    }

    /**
     * Get location by ID
     * @param id - The ID of the location
     * @returns {Location} - The location entity if found, otherwise undefined
     */
    function getLocationById(id) {
        return catalogStore.getLocationById(id);
    }

    /**
     * Add a new user account
     * @param userAccount - The user account entity to add
     * @returns {Promise<UserAccount>} - The added user account entity
     */
    function addUserAccount(userAccount) {
        return new Promise((resolve, reject) => {
            const resource = UserAccountAssembler.toResourceFromEntity(userAccount);
            iamApi.createUserAccount(resource).then(response => {
                const responseData = response.data;
                const newUserAccount = UserAccountAssembler.toEntityFromResource(responseData);
                userAccounts.value.push(newUserAccount);
                resolve(newUserAccount);
            }).catch(error => {
                errors.value.push(error);
                reject(error);
            });
        });
    }

    /**
     * Add a new user
     * @param user - The user entity to add
     * @returns {Promise<User>} - The added user entity
     */
    function addUser(user) {
        return new Promise((resolve, reject) => {
            const resource = UserAssembler.toResourceFromEntity(user);
            iamApi.createUser(resource).then(response => {
                // Handle both AWS (single object) and Supabase (array) responses
                let responseData = response.data;

                // If response is an array (Supabase), get the first element
                if (Array.isArray(responseData)) {
                    responseData = responseData[0];
                }

                const newUser = UserAssembler.toEntityFromResource(responseData);
                users.value.push(newUser);
                resolve(newUser);
            }).catch(error => {
                errors.value.push(error);
                reject(error);
            });
        });
    }

    /**
     * Add a new location
     * @param location - The location entity to add
     */
    function addLocation(location) {
        return catalogStore.addLocation(location);
    }

    /**
     * Update a location
     * @param location - The location entity with updated data
     */
    function updateLocation(location) {
        catalogStore.updateLocation(location.id, location);
    }

    /**
     * Delete a location by ID
     * @param id - The ID of the location to delete
     */
    function deleteLocation(id) {
        catalogStore.deleteLocation(id);
    }

    /**
     * Update a user account
     * @param id - The ID of the user account to update
     * @param accountData - The updated user account data
     * @returns {Promise<UserAccount>} - The updated user account response
     */
    const updateUserAccount = async (id,accountData) => {
        loading.value = true;
        errors.value = [];
        try {
            const accountId = Number(id);
            const response = await iamApi.updateUserAccount(accountId, accountData)
            const index = userAccounts.value.findIndex(v => Number(v.id) === accountId);
            if (index !== -1) {
                userAccounts.value[index] = {
                    ...userAccounts.value[index],
                    ...accountData,
                    id: accountId,
                };
            }
            loading.value = false;
            return response;
        } catch (error) {
            errors.value.push(error);
            loading.value = false;
            throw error;
        }
    }

    function addPayment(payment) {
        return paymentStore.addPayment(payment);
    }

    /**
     * Update a payment
     * @param updatedPayment - The payment entity with updated data
     */
    function updatePayment(updatedPayment) {
        paymentStore.updatePayment(updatedPayment);
    }

    /**
     * Delete a payment by ID
     * @param id - The ID of the payment to delete
     */
    function deletePayment(id) {
        paymentStore.deletePayment(id);
    }

    /**
     * Start the registration flow by setting the role
     * @param role - The role to register (vehicle owner or workshop)
     */
    function startRegistrationFlow(role) {
        if (!Object.values(RoleChoicesType).includes(role)) {
            console.error(`Invalid role provided: ${role}`);
            return;
        }
        registerRole.value = role;
        registerUser.value = null;
        registerUserAccount.value = null;
        registerPayment.value = null;
        registerLocation.value = null;
        registerMemberShipType.value = null;
        errors.value = null;
        errors.value = [];
    }

    /**
     * Save vehicle owner registration data into the store
     * @param form - The registration form data
     */
    function saveRegisterOwner(form) {
        const newLocation = new Location({
            id: null, // Backend will assign ID
            department: form.department,
            district: form.district,
            address: form.address
        })

        const newUser = new User({
            id: null, // Backend will assign ID
            name: form.fullName.split(' ')[0] || '',
            last_name: form.fullName.split(' ').slice(1).join(' ') || '',
            dni: form.dni,
            phone_number: form.phone_number,
            location_id: null, // Will be set after location is created
            department: form.department,
            district: form.district,
            address: form.address
        })

        const newUserAccount = new UserAccount({
            id: null, // Backend will assign ID
            username: form.username.trim(),
            email: form.email.trim(),
            user_id: null, // Will be set after user is created
            role_id: VEHICLE_OWNER_ROLE_ID,
            membership_id: null, // Will be set when plan is selected
            password: form.password,
            is_new: true
        });

        registerLocation.value = newLocation;
        registerUser.value = newUser;
        registerUserAccount.value = newUserAccount;
        registerRole.value = RoleChoicesType.VEHICLE_OWNER;
    }

    /**
     * Save workshop registration data into the store
     * @param form - The registration form data
     */
    function saveRegisterWorkshop(form) {
        const newLocation = new Location({
            id: null, // Backend will assign ID
            department: form.department,
            district: form.district,
            address: form.address
        })

        const newUser = new User({
            id: null, // Backend will assign ID
            name: form.workshopName || '', // Workshop name as user name
            last_name: '', // Workshop doesn't have last name
            dni: form.ruc, // RUC is used as DNI for workshops
            phone_number: form.phone_number,
            location_id: null // Will be set after location is created
        })

        const newUserAccount = new UserAccount({
            id: null, // Backend will assign ID
            username: form.username.trim(),
            email: form.email.trim(),
            user_id: null, // Will be set after user is created
            role_id: WORKSHOP_ROLE_ID,
            membership_id: null, // Will be set when plan is selected
            password: form.password,
            is_new: true
        });

        registerLocation.value = newLocation;
        registerUser.value = newUser;
        registerUserAccount.value = newUserAccount;
        registerRole.value = RoleChoicesType.AUTO_REPAIR_WORKSHOP;
    }

    /**
     * Select membership plan and update user account accordingly
     * @param plan - The plan duration key (e.g., 'monthly', 'yearly')
     */
    function selectPlan(plan) {
        const membershipId = MembershipChoice[plan];

        if (!membershipId) {
            console.error(`Invalid plan duration key: ${plan}`);
            return;
        }

        registerMemberShipType.value = membershipId;

        const userAccountNoMembership = registerUserAccount.value;
        if (userAccountNoMembership) {
            userAccountNoMembership.membership_id = membershipId;
            // For reactivity in Vue, it's often best practice to create a new object
            registerUserAccount.value = {...userAccountNoMembership};
        }
    }
    async function finishRegister(paymentDetails) {
        console.log('🏁 [IAM-STORE] ========== INICIO DE finishRegister ==========');

        const role = registerRole.value;
        const user = registerUser.value;
        const userAccount = registerUserAccount.value;
        const location = registerLocation.value;
        const membershipId = registerMemberShipType.value;

        // Validar y limpiar DNI (debe ser exactamente 8 dígitos)
        if (user?.dni) {
            const cleanDni = user.dni.trim();
            if (!/^\d{8}$/.test(cleanDni)) {
                const errorMsg = `DNI inválido: debe tener exactamente 8 dígitos. Recibido: "${cleanDni}" (${cleanDni.length} caracteres)`;
                console.error('❌ [IAM-STORE]', errorMsg);
                errors.value.push(new Error(errorMsg));
                throw new Error(errorMsg);
            }
            user.dni = cleanDni; // Asegurar que está limpio
            console.log('✅ [IAM-STORE] DNI validado:', cleanDni);
        }

        console.log('📊 [IAM-STORE] Datos de registro recopilados:', {
            role,
            user: { name: user?.name, last_name: user?.last_name, dni: user?.dni, phone_number: user?.phone_number },
            userAccount: { username: userAccount?.username, email: userAccount?.email },
            location: { address: location?.address, district: location?.district, department: location?.department },
            membershipId,
            paymentDetails: {
                card_number: paymentDetails?.card_number,
                card_type: paymentDetails?.card_type,
                month: paymentDetails?.month,
                year: paymentDetails?.year,
                cvv: paymentDetails?.cvv ? '***' : 'vacío'
            }
        });

        loading.value = true;
        errors.value = [];

        if(!role || !user || !userAccount || !location || !membershipId || !paymentDetails) {
            const errorMsg = 'Incomplete registration flow. Please restart.';
            console.error('❌ [IAM-STORE] Datos incompletos:', {
                hasRole: !!role,
                hasUser: !!user,
                hasUserAccount: !!userAccount,
                hasLocation: !!location,
                hasMembershipId: !!membershipId,
                hasPaymentDetails: !!paymentDetails
            });
            errors.value.push(new Error(errorMsg));
            loading.value = false;
            return;
        }

        try {
            console.log('🔄 [IAM-STORE] Starting registration process...');

            let response;

            // Determinar el tipo de membership_description
            const membershipDescriptions = {
                1: 'monthly',
                2: 'quarterly',
                3: 'annual'
            };
            const membershipDescription = membershipDescriptions[membershipId] || 'monthly';
            console.log('📅 [IAM-STORE] Membership description:', membershipDescription);

            // Intentar registro con AWS primero (usando AuthApi)
            if (apiConfig.isAwsPrimary) {
                try {
                    console.log('☁️ [IAM-STORE] Attempting AWS registration...');
                    console.log('🔑 [IAM-STORE] API Strategy:', apiConfig.strategy);

                    if (role === RoleChoicesType.VEHICLE_OWNER) {
                        // Registro de Vehicle Owner
                        const vehicleOwnerRequest = {
                            name: user.name || '',
                            last_name: user.last_name || '',
                            dni: user.dni || '',
                            phone_number: user.phone_number || '',
                            username: userAccount.username || '',
                            email: userAccount.email || '',
                            password: userAccount.password || '',
                            address: location.address || '',
                            district: location.district || '',
                            department: location.department || '',
                            membership_description: membershipDescription,
                            started: new Date().toISOString().split('T')[0],
                            over: new Date(Date.now() + 365*24*60*60*1000).toISOString().split('T')[0],
                            card_number: String(paymentDetails.card_number || ''),
                            card_type: String(paymentDetails.card_type || ''),
                            month: parseInt(paymentDetails.month) || 1,
                            year: parseInt(paymentDetails.year) || new Date().getFullYear(),
                            cvv: parseInt(paymentDetails.cvv) || 0
                        };

                        console.log('👤 [IAM-STORE] Vehicle Owner Request (datos preparados):', {
                            ...vehicleOwnerRequest,
                            password: '***',
                            cvv: '***'
                        });

                        console.log('📤 [IAM-STORE] Enviando POST a signUpVehicleOwner...');
                        response = await authApi.signUpVehicleOwner(vehicleOwnerRequest);
                        console.log('✅ [IAM-STORE] Respuesta de AWS recibida:', {
                            id: response.id,
                            username: response.username,
                            email: response.email,
                            hasToken: !!response.token
                        });

                    } else if (role === RoleChoicesType.AUTO_REPAIR_WORKSHOP) {
                        // Registro de Auto Repair Workshop
                        const autoRepairRequest = {
                            auto_repair_name: user.name || '',
                            phone_number: user.phone_number || '',
                            username: userAccount.username || '',
                            contact_email: userAccount.email || '',
                            password: userAccount.password || '',
                            ruc: user.dni || '',
                            address: location.address || '',
                            district: location.district || '',
                            department: location.department || '',
                            membership_description: membershipDescription,
                            started: new Date().toISOString().split('T')[0],
                            over: new Date(Date.now() + 365*24*60*60*1000).toISOString().split('T')[0],
                            card_number: String(paymentDetails.card_number || ''),
                            card_type: String(paymentDetails.card_type || ''),
                            month: parseInt(paymentDetails.month) || 1,
                            year: parseInt(paymentDetails.year) || new Date().getFullYear(),
                            cvv: parseInt(paymentDetails.cvv) || 0
                        };

                        console.log('🏭 [IAM-STORE] Auto Repair Request (datos preparados):', {
                            ...autoRepairRequest,
                            password: '***',
                            cvv: '***'
                        });

                        console.log('📤 [IAM-STORE] Enviando POST a signUpAutoRepair...');
                        response = await authApi.signUpAutoRepair(autoRepairRequest);
                        console.log('✅ [IAM-STORE] Respuesta de AWS recibida:', {
                            id: response.id,
                            username: response.username,
                            email: response.email,
                            hasToken: !!response.token
                        });
                    }

                    // Guardar JWT token
                    if (response.token) {
                        localStorage.setItem('authToken', response.token);
                        console.log('🔐 [IAM-STORE] JWT token guardado en localStorage');
                    } else {
                        console.warn('⚠️ [IAM-STORE] No se recibió JWT token en la respuesta');
                    }

                    // Cargar datos del usuario desde el backend
                    console.log('🔄 [IAM-STORE] Cargando datos del usuario desde el backend...');
                    await fetchUserAccounts();
                    await fetchUsers();
                    await catalogStore.fetchLocations();
                    console.log('✅ [IAM-STORE] Datos cargados desde el backend');

                    // Buscar el usuario creado por ID retornado
                    console.log('🔍 [IAM-STORE] Buscando usuario creado con ID:', response.id);
                    const account = userAccounts.value.find(a => a.id === response.id);
                    if (!account) {
                        console.error('❌ [IAM-STORE] No se encontró UserAccount con ID:', response.id);
                        console.log('📋 [IAM-STORE] UserAccounts disponibles:', userAccounts.value.map(a => ({ id: a.id, username: a.username })));
                        throw new Error("User account not found after registration");
                    }
                    console.log('✅ [IAM-STORE] UserAccount encontrado:', { id: account.id, username: account.username });

                    const createdUser = users.value.find(u => u.id === account.user_id);
                    if (!createdUser) {
                        console.error('❌ [IAM-STORE] No se encontró User con ID:', account.user_id);
                        console.log('📋 [IAM-STORE] Users disponibles:', users.value.map(u => ({ id: u.id, name: u.name })));
                        throw new Error("User not found after registration");
                    }
                    console.log('✅ [IAM-STORE] User encontrado:', { id: createdUser.id, name: createdUser.name });

                    // Establecer sesión
                    sessionUserAccount.value = account;
                    sessionUser.value = createdUser;
                    saveSessionToStorage();
                    console.log('✅ [IAM-STORE] Sesión establecida y guardada');

                    console.log('🎉 [IAM-STORE] ========== AWS REGISTRATION COMPLETED SUCCESSFULLY ==========');
                    return;

                } catch (awsError) {
                    console.error('❌ [IAM-STORE] ========== AWS REGISTRATION FAILED ==========');
                    console.error('📋 [IAM-STORE] Error details:', {
                        message: awsError.message,
                        response: awsError.response?.data,
                        status: awsError.response?.status,
                        statusText: awsError.response?.statusText
                    });
                    console.warn('🔄 [IAM-STORE] Trying Supabase fallback...');

                    // Limpiar cualquier token parcial
                    localStorage.removeItem('authToken');
                    sessionStorage.removeItem('authToken');
                    // Continúa al fallback de Supabase
                }
            }

            // Fallback: Registro manual con Supabase (creación de entidades una por una)
            console.log('💾 [IAM-STORE] ========== USING SUPABASE MANUAL REGISTRATION ==========');

            // Get catalog and payment APIs from their stores
            const catalogApi = catalogStore.catalogApi;
            const paymentApi = paymentStore.paymentServiceApi;

            // Step 1: Create Location
            console.log('📍 Creating location...', location);
            const locationResource = LocationAssembler.toResourceFromEntity(location);
            const locationResponse = await catalogApi.createLocation(locationResource);

            let createdLocation = locationResponse.data;
            if (Array.isArray(createdLocation)) {
                createdLocation = createdLocation[0];
            }
            console.log('✅ Location created:', createdLocation);

            // Step 2: Create User with location ID
            user.location_id = createdLocation.id;
            console.log('👤 Creating user...', user);
            const userResource = UserAssembler.toResourceFromEntity(user);
            const userResponse = await iamApi.createUser(userResource);

            let createdUser = userResponse.data;
            if (Array.isArray(createdUser)) {
                createdUser = createdUser[0];
            }
            console.log('✅ User created:', createdUser);

            // Step 3: Create UserAccount with user ID and membership ID
            userAccount.user_id = createdUser.id;
            userAccount.membership_id = membershipId;
            console.log('🔐 Creating user account...', userAccount);
            const userAccountResource = UserAccountAssembler.toResourceFromEntity(userAccount);
            const userAccountResponse = await iamApi.createUserAccount(userAccountResource);

            let createdUserAccount = userAccountResponse.data;
            if (Array.isArray(createdUserAccount)) {
                createdUserAccount = createdUserAccount[0];
            }
            console.log('✅ User account created:', createdUserAccount);

            // Step 4: Create Payment with user account ID
            const newPayment = new Payment({
                id: null,
                card_number: paymentDetails.card_number,
                card_type: paymentDetails.card_type,
                month: paymentDetails.month,
                year: paymentDetails.year,
                cvv: paymentDetails.cvv,
                user_account_id: createdUserAccount.id
            });

            console.log('💳 Creating payment...', newPayment);
            const paymentResource = PaymentAssembler.toResourceFromEntity(newPayment);
            const paymentResponse = await paymentApi.createPayment(paymentResource);

            let createdPayment = paymentResponse.data;
            if (Array.isArray(createdPayment)) {
                createdPayment = createdPayment[0];
            }
            console.log('✅ Payment created:', createdPayment);

            // Step 5: Store created entities in local arrays
            const locationEntity = LocationAssembler.toEntityFromResource(createdLocation);
            const userEntity = UserAssembler.toEntityFromResource(createdUser);
            const userAccountEntity = UserAccountAssembler.toEntityFromResource(createdUserAccount);
            const paymentEntity = PaymentAssembler.toEntityFromResource(createdPayment);

            locations.value.push(locationEntity);
            users.value.push(userEntity);
            userAccounts.value.push(userAccountEntity);
            payments.value.push(paymentEntity);

            // Step 6: Set session and save to storage
            sessionUserAccount.value = userAccountEntity;
            sessionUser.value = userEntity;
            saveSessionToStorage();

            console.log('🎉 Supabase registration completed successfully!');

        } catch (err) {
            console.error('❌ [IAM-STORE] ========== REGISTRATION FAILED ==========');
            console.error('📋 [IAM-STORE] Error completo:', {
                message: err.message,
                response: err.response?.data,
                status: err.response?.status,
                stack: err.stack
            });
            const errorMessage = err.response?.data?.message || err.message || 'Registration failed';
            errors.value.push(new Error(errorMessage));
            throw err;
        } finally {
            loading.value = false;
            console.log('🏁 [IAM-STORE] ========== FIN DE finishRegister ==========');
        }
    }

    /**
     * Reset the registration flow state
     */
    function resetRegistrationFlow() {
        registerRole.value = null;
        registerUser.value = null;
        registerUserAccount.value = null;
        registerPayment.value = null;
        registerLocation.value = null;
        registerMemberShipType.value = null;
        errors.value = null;
    }


    return {
        userAccounts,
        users,
        loading,
        errors,
        sessionUserId,
        sessionUserAccountId,
        isCurrentUser,
        isCurrentUserAccount,
        sessionUserAccount,
        sessionUser,
        registerUser,
        registerUserAccount,
        userAccountsLoaded,
        userLoaded,
        registerPayment,
        registerRole,
        registerLocation,
        registerMemberShipType,
        locations,
        payments,
        userAccountCount,
        userCount,
        paymentCount,
        locationCount,
        isAuthenticated,
        roleId,
        fullName,
        restoreSessionFromStorage,
        login,
        logout,
        fetchUserAccounts,
        fetchUsers,
        getUserById,
        getUserAccountById,
        addUserAccount,
        addUser,
        getLocationById,
        addLocation,
        updateLocation,
        deleteLocation,
        addPayment,
        updatePayment,
        deletePayment,
        startRegistrationFlow,
        saveRegisterOwner,
        saveRegisterWorkshop,
        selectPlan,
        finishRegister,
        resetRegistrationFlow,
        updateUserAccount,
        hasActiveJWT
    };
});

export default useIamStore;
