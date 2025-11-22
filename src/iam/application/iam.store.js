import {IamApi} from "@/iam/infrastructure/iam-api.js";
import {defineStore} from "pinia";
import {computed, ref} from "vue";
import {UserAccountAssembler} from "@/iam/infrastructure/user-account.assembler.js";
import {UserAssembler} from "@/iam/infrastructure/user.assembler.js";
import {User} from "@/iam/domain/model/user.entity.js";
import {UserAccount} from "@/iam/domain/model/user-account.entity.js";
import {Location} from "@/auto-repair-catalog/domain/model/location.entity.js";
import {Payment} from "@/payment-service/domain/model/payment.entity.js";

import useCatalogStore from "@/auto-repair-catalog/application/owner.store.js";
import usePaymentStore from "@/payment-service/application/payment-service.store.js";

import {MembershipChoice} from "@/data-collection-diagnosis/domain/types/membership-choice.js";
import {RoleChoicesType} from "@/data-collection-diagnosis/domain/types/role-choice.js";

const VEHICLE_OWNER_ROLE_ID = 'R001';
const WORKSHOP_ROLE_ID = 'R002';

/**
 * IAM API instance
 * @type {IamApi} - Instance of the IAM API for making requests
 */
const iamApi = new IamApi();

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
     * @type {import("vue").ComputedRef<string|null>} - The user ID or null if not logged in
     */
    const sessionUserId = computed(() => sessionUser.value?.id_user ?? null);

    /**
     * Get the current session user account ID
     * @type {import("vue").ComputedRef<string|null>} - The user account ID or null if not logged in
     */
    const sessionUserAccountId = computed(() => sessionUserAccount.value?.id_user_account ?? null);

    /**
     * Check if the given user ID matches the current session user ID
     * @param userId - The user ID to check
     * @returns {boolean} - True if it matches, false otherwise
     */
    function isCurrentUser(userId) {
        const current = sessionUserId.value;
        if (!current || !userId) return false;
        return String(current) === String(userId);
    }

    /**
     * Check if the given account ID matches the current session user account ID
     * @param accountId - The account ID to check
     * @returns {boolean} - True if it matches, false otherwise
     */
    function isCurrentUserAccount(accountId) {
        const current = sessionUserAccountId.value;
        if (!current || !accountId) return false;
        return String(current) === String(accountId);
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
    const roleId = computed(() => sessionUserAccount.value?.id_role ?? '');

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

            if (userAccount && user) {
                const sessionData = {
                    userAccount: userAccount,
                    user: user,
                    timestamp: Date.now()
                };
                localStorage.setItem('prime-fix-session', JSON.stringify(sessionData));
            }
        } catch (err) {
            console.warn('Failed to save session to localStorage:', err);
        }
    }

    /**
     * Clear session from local storage
     */
    function clearSessionStorage() {
        if (typeof localStorage === 'undefined') return;

        try {
            localStorage.removeItem('prime-fix-session');
        } catch (err) {
            console.warn('Failed to clear session from localStorage:', err);
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
            if (sessionData) {
                const parsed = JSON.parse(sessionData);
                const {userAccount: rawUserAccount, user: rawUser} = parsed;

                // Lógica de validación
                const isOwner = rawUserAccount?.id_role === VEHICLE_OWNER_ROLE_ID;
                const isWorkshop = rawUserAccount?.id_role === WORKSHOP_ROLE_ID;

                const hasUserAccountData = rawUserAccount
                    && typeof rawUserAccount.id_role === 'string'
                    && (isOwner || isWorkshop);
                const hasUserData = rawUser
                    && typeof rawUser.id_user === 'string'
                    && rawUser.id_user.length > 0;

                if (hasUserAccountData && hasUserData) {
                    const userAccount = new UserAccount(rawUserAccount);
                    const user = new User(rawUser);

                    sessionUserAccount.value = userAccount;
                    sessionUser.value = user;

                    // Usando RoleChoicesType para obtener el nombre legible
                    const roleName = isOwner ? RoleChoicesType.VEHICLE_OWNER : RoleChoicesType.AUTO_REPAIR_WORKSHOP;

                    console.log(`Session restored: User ${userAccount.username || userAccount.email || user.name || 'Unknown'} with role ${userAccount.id_role} (${roleName})`);
                } else {
                    console.error('NOT LOGGED - Corrupted session detected and cleared.');
                    clearSessionStorage();
                }
            } else {
                console.log('NOT LOGGED - No session found in localStorage');
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
        iamApi.getUserAccounts().then(response =>{
            userAccounts.value = UserAccountAssembler.toEntitiesFromResponse(response);
            userAccountsLoaded.value = true;
        }).catch(error=>{
          errors.value.push(error);
        })
    }

    /**
     * Fetch users from the API and store them
     */
    function fetchUsers() {
        iamApi.getUsers().then(response =>{
            users.value = UserAssembler.toEntitiesFromResponse(response);
            userLoaded.value = true;
        }).catch(error=>{
            errors.value.push(error);
        })
    }

    /**
     * Login a user with email and password
     * @param email - The user's email
     * @param password - The user's password
     * @returns {Promise<UserAccount>} - The logged-in user account
     */
    async function login(email, password) {
        loading.value = true;
        errors.value = [];
        try {
            if (!userAccountsLoaded.value) {
                await fetchUserAccounts();
            }
            if (!userLoaded.value) {
                await fetchUsers();
            }
            const account = userAccounts.value.find(a =>
                a.email?.toLowerCase().trim() === email.toLowerCase().trim()
            );

            if (!account) throw new Error("User or password incorrect");

            if (account.password.trim() !== password.trim()) {
                throw new Error("User or password incorrect");
            }

            const user = users.value.find(u => u.id_user === account.id_user);
            if (!user) throw new Error("User not found");

            sessionUserAccount.value = account;
            sessionUser.value = user;

            saveSessionToStorage();
            return account;
        } catch (err) {
            errors.value.push(formatError(err, "Login failed"));
            throw err;
        } finally {
            loading.value = false;
        }
        try {
            try {
                saveSessionToStorage();
                console.log("Sesión guardada en localStorage");
            } catch (e) {
                console.error("Error guardando sesión:", e);
            }

            return account;
        } catch (err) {
            errors.value.push(formatError(err, "Login failed"));
            throw err;
        }
    }

    /**
     * Logout the current user and clear session data
     */
    function logout() {
        sessionUserAccount.value = null;
        sessionUser.value = null;
        clearSessionStorage();
        console.log('Logout successful');
    }

    /**
     * Get user by ID
     * @param id - The ID of the user
     * @returns {User} - The user entity if found, otherwise undefined
     */
    function getUserById(id) {
        return users.value.find(u => u.id_user === id);
    }

    /**
     * Get user account by ID
     * @param id - The ID of the user account
     * @returns {UserAccount} - The user account entity if found, otherwise undefined
     */
    function getUserAccountById(id) {
        return userAccounts.value.find(ua => ua.id_user_account === id);
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
                const responseData = response.data;
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
        catalogStore.updateLocation(location.id_location, location);
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
            const index = userAccounts.value.findIndex(v => Number(v.id_user_account) === accountId);
            if (index !== -1) {
                userAccounts.value[index] = {
                    ...userAccounts.value[index],
                    ...userAccounts,
                    id_user_account: accountId,
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
            id_location: 'L0' + (locationCount + 1).toString(),
            department: form.department,
            district: form.district,
            address: form.address
        })

        const newUser = new User({
            id_user: 'U0' + (users.value.length + 1).toString(),
            name: form.fullName.split(' ')[0] || '',
            last_name: form.fullName.split(' ').slice(1).join(' '),
            dni: form.dni,
            phone_number: form.phone_number,
            id_location: newLocation.id_location,
        })

        const newUserAccount = new UserAccount({
            id_user_account: 'UA' + (userAccounts.value.length + 1).toString(),
            username: form.username.trim(),
            email: form.email.trim(),
            id_user: newUser.id_user,
            id_role: VEHICLE_OWNER_ROLE_ID,
            id_membership: '',
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
            id_location: 'L0' + (locationCount + 1).toString(),
            department: form.department,
            district: form.district,
            address: form.address
        })

        const newUser = new User({
            id_user: 'U0' + (users.value.length + 1).toString(),
            name: form.name,
            last_name: '',
            dni: form.ruc,
            phone_number: form.phone_number,
            id_location: newLocation.id_location,
        })

        const newUserAccount = new UserAccount({
            id_user_account: 'UA' + (userAccounts.value.length + 1).toString(),
            username: form.username.trim(),
            email: form.email.trim(),
            id_user: newUser.id_user,
            id_role: WORKSHOP_ROLE_ID,
            id_membership: '',
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
            userAccountNoMembership.id_membership = membershipId;
            // For reactivity in Vue, it's often best practice to create a new object
            registerUserAccount.value = {...userAccountNoMembership};
        }
    }
    async function finishRegister(paymentDetails) {
        const role = registerRole.value;
        const user = registerUser.value;
        const userAccount = registerUserAccount.value;
        const location = registerLocation.value;
        const membershipId = registerMemberShipType.value;
        loading.value = true;
        error.value = null;

        if(!role || !user || !userAccount || !location || !membershipId || !paymentDetails) {
            error.value = 'Incomplete registration flow. Please restart.';
            loading.value = false;
            return;
        }

        const newPayment = new Payment({
            id_payment: 'PY0' + (paymentStore.paymentCount + 1).toString(), // Simulado
            card_number: paymentDetails.card_number,
            card_type: paymentDetails.card_type,
            month: paymentDetails.month,
            year: paymentDetails.year,
            cvv: paymentDetails.cvv,
            id_user_account: userAccount.id_user_account
        });

        try {
            // Ejecutar llamadas a la API de forma transaccional (secuencial)
            await addLocation(location);
            await addUser(user);
            await addUserAccount(userAccount);
            await addPayment(newPayment);

            // Iniciar sesión automáticamente
            sessionUserAccount.value = userAccount;
            sessionUser.value = user;
            saveSessionToStorage();

        } catch (err) {
            // El error se establece dentro de las funciones CRUD (addUser, etc.)
            error.value = error.value || formatError(err, 'Final registration step failed');
            errors.value.push(err);
        } finally {
            loading.value = false;
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

    /**
     * Load session from local storage on app start
     */
    function loadSessionFromStorage() {
        const storedUserAccount = localStorage.getItem('userAccount');
        const storedUser = localStorage.getItem('user');
        const storedIsAuthenticated = localStorage.getItem('isAuthenticated');

        if (storedIsAuthenticated === 'true' && storedUserAccount) {
            try {
                sessionUserAccount.value = JSON.parse(storedUserAccount);
                if (storedUser) {
                    sessionUser.value = JSON.parse(storedUser);
                }
                console.log('Session loaded from storage', sessionUserAccount.value);
            } catch (e) {
                console.error('Error loading session from storage', e);
                clearSession();
            }
        }
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
        loadSessionFromStorage,
        updateUserAccount
    };
});

export default useIamStore;
