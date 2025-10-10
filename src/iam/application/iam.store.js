import {IamApi} from "@/iam/infrastructure/iam-api.js";
import {defineStore} from "pinia";
import {computed, ref} from "vue";
import {LocationAssembler} from "@/iam/infrastructure/location.assembler.js";
import {PaymentAssembler} from "@/iam/infrastructure/payment.assembler.js";
import {UserAccountAssembler} from "@/iam/infrastructure/user-account.assembler.js";
import {UserAssembler} from "@/iam/infrastructure/user.assembler.js";
import {Location} from "@/iam/domain/model/location.entity.js";
import {User} from "@/iam/domain/model/user.entity.js";
import {UserAccount} from "@/iam/domain/model/user-account.entity.js";
import {Payment} from "@/iam/domain/model/payment.entity.js";

/**
 * Singleton instance of IamApi to be used across the store.
 * @type {IamApi}
 */
const iamApi = new IamApi();

const useIamStore = defineStore('iam', () => {
    /**
     * List of locations.
     * @type {import('vue').Ref<Location[]>}
     */
    const locations = ref([]);
    /**
     * List of payments.
     * @type {import('vue').Ref<Payment[]>}
     */
    const payments = ref([]);
    /**
     * List of users.
     * @type {import('vue').Ref<User[]>}
     */
    const users = ref([]);
    /**
     * List of user accounts.
     * @type {import('vue').Ref<UserAccount[]>}
     */
    const userAccounts = ref([]);

    /**
     * List of errors.
     * @type {import('vue').Ref<Error[]>}
     */
    const errors = ref([]);

    /**
     * Indicates if locations have been loaded.
     * @type {import('vue').Ref<boolean>}
     */
    const locationsLoaded = ref(false);
    /**
     * Indicates if payments have been loaded.
     * @type {import('vue').Ref<boolean>}
     */
    const paymentsLoaded = ref(false);
    /**
     * Indicates if users have been loaded.
     * @type {import('vue').Ref<boolean>}
     */
    const usersLoaded = ref(false);
    /**
     * Indicates if user accounts have been loaded.
     * @type {import('vue').Ref<boolean>}
     */
    const userAccountsLoaded = ref(false);

    /**
     * Count of locations.
     * @type {import('vue').ComputedRef<number>}
     */
    const locationsCount = computed(() => {
        return locationsLoaded ? locations.value.length : 0;
    });

    /**
     * Count of payments.
     * @type {import('vue').ComputedRef<number>}
     */
    const paymentsCount = computed(() => {
        return paymentsLoaded ? payments.value.length : 0;
    });

    /**
     * Count of users.
     * @type {import('vue').ComputedRef<number>}
     */
    const usersCount = computed(() => {
        return usersLoaded ? users.value.length : 0;
    });

    /**
     * Count of user accounts.
     * @type {import('vue').ComputedRef<number>}
     */
    const userAccountsCount = computed(() => {
        return userAccountsLoaded ? userAccounts.value.length : 0;
    });


    /**
     * The currently authenticated user's account.
     * @type {import('vue').Ref<UserAccount|null>}
     */
    const sessionUserAccount = ref(null);
    /**
     * The currently authenticated user.
     * @type {import('vue').Ref<User|null>}
     */
    const sessionUser = ref(null);
    /**
     * Indicates if a user is authenticated.
     * @type {import('vue').ComputedRef<boolean>}
     */
    const isAuthenticated = computed(() => !!sessionUserAccount.value);
    /**
     * The role ID of the currently authenticated user.
     * @type {import('vue').ComputedRef<string|null>}
     */
    const roleId = computed(() => sessionUserAccount.value ? sessionUserAccount.value.id_role : null);

    /**
     * Registration location during the registration flow.
     * @type {import('vue').Ref<Location|null>}
     */
    const registerLocation = ref(null);

    /**
     * Registration payment during the registration flow.
     * @type {import('vue').Ref<Payment|null>}
     */
    const registerPayment = ref(null);

    /**
     * Registration user during the registration flow.
     * @type {import('vue').Ref<User|null>}
     */
    const registerUser = ref(null);

    /**
     * Registration user account during the registration flow.
     * @type {import('vue').Ref<UserAccount|null>}
     */
    const registerUserAccount = ref(null);

    /**
     * Registration membership type during the registration flow.
     * @type {import('vue').Ref<string|null>}
     */
    const registerMemberShipType = ref(null);

    /**
     * Load session from localStorage if available.
     * This function should be called on application startup to restore the session.
     * @returns {void}
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

    /**
     * Simulated login function.
     * @param email - User email
     * @param password - User password
     * @returns {Promise<unknown>} - Resolves with user account on success, rejects with error on failure.
     */
    function login(email, password) {
        return new Promise((resolve, reject) => {
            const userAccount = userAccounts.value.find(
                account => account.email === email && account.password === password
            );
            if (userAccount) {
                sessionUserAccount.value = userAccount;
                const user = users.value.find(u => u.id === userAccount.id_user);
                if (user) {
                    sessionUser.value = user;
                    localStorage.setItem('user', JSON.stringify(user));
                }
                localStorage.setItem('userAccount', JSON.stringify(userAccount));
                localStorage.setItem('isAuthenticated', 'true');

                console.log('Login successful', userAccount);
                resolve(userAccount);
            } else {
                reject(new Error('Invalid credentials'));
            }
        });
    }

    /**
     * Logs out the current user and clears the session.
     * @returns {void}
     */
    function logout() {
        sessionUserAccount.value = null;
        sessionUser.value = null;
        clearSession();
        console.log('Logout successful');
    }

    /**
     * Clears session data from localStorage.
     * @returns {void}
     */
    function clearSession() {
        localStorage.removeItem('userAccount');
        localStorage.removeItem('user');
        localStorage.removeItem('isAuthenticated');
    }

    /**
     * Gets the access token for the current session.
     * @returns {string|null} - The access token if authenticated, otherwise null.
     */
    function getAccessToken() {
        return isAuthenticated.value ? 'simulated-token-' + sessionUserAccount.value?.id : null;
    }


    /**
     * Starts the registration flow for a given role.
     * @param role - The role for the new user ('owner' or 'workshop').
     */
    function startRegistrationFlow(role) {
        registerLocation.value = null;
        registerPayment.value = null;
        registerUser.value = null;
        registerUserAccount.value = null;
        registerMemberShipType.value = role;
    }

    /**
     * Saves the registration data for an owner.
     * @param fullName - Full name of the owner
     * @param username - Username for the account
     * @param dni - DNI number
     * @param phone_number - Phone number
     * @param department - Department
     * @param district - District
     * @param address - Address
     * @param email - Email address
     * @param password - Password
     */
    function saveRegisterOwner({ fullName, username, dni, phone_number, department,
                               district, address, email, password }) {
        const newLocation = new Location({
            id_location: 'L0' + (locationsCount.value + 1).toString(),
            department: department,
            district: district,
            address: address
        });

        const newUser = new User({
            id_user: 'U0' + (usersCount.value + 1).toString(),
            name: fullName.split(' ')[0] || '',
            last_name: fullName.split(' ').slice(1).join(' '),
            dni: dni,
            phone_number: phone_number,
            id_location: newLocation.id
        });

        const newUserAccount = new UserAccount({
           id_user_account: 'UA' + (userAccountsCount.value + 1).toString(),
           username: username.trim(),
            email: email.trim(),
            id_user: newUser.id,
            id_role: 'R001',
            id_membership: '', // No membership at registration
            password: password.trim(),
        });

        registerLocation.value = newLocation;
        registerUser.value = newUser;
        registerUserAccount.value = newUserAccount;
    }

    /**
     * Saves the registration data for a workshop.
     * @param workshopName - Name of the workshop
     * @param username - Username for the account
     * @param ruc - RUC number
     * @param phone_number - Phone number
     * @param department - Department
     * @param district - District
     * @param address - Address
     * @param email - Email address
     * @param password - Password
     */
    function saveRegisterWorkshop({ workshopName, username, ruc, phone_number, department, district, address, email, password }) {
        const newLocation = new Location({
            id_location: 'L0' + (locationsCount.value + 1).toString(),
            department: department,
            district: district,
            address: address
        });

        const newUser = new User({
            id_user: 'U0' + (usersCount.value + 1).toString(),
            name: workshopName,
            last_name: '',
            dni: ruc,
            phone_number: phone_number,
            id_location: newLocation.id
        });

        const newUserAccount = new UserAccount({
            id_user_account: 'UA' + (userAccountsCount.value + 1).toString(),
            username: username.trim(),
            email: email.trim(),
            id_user: newUser.id_user,
            id_role: 'R002',
            id_membership: '', // No membership at registration
            password: password.trim(),
        });

        registerLocation.value = newLocation;
        registerUser.value = newUser;
        registerUserAccount.value = newUserAccount;
    }


    /**
     * Selects a membership plan and updates the registration data accordingly.
     * @param plan - The selected plan ('3m', '12m', or '1m')
     */
    function selectPlan(plan) {
        const membershipId = plan === '3m' ? 'M001' : plan === '12m' ? 'M002' : 'M003';

        const userAccountNoMembership = registerUserAccount.value;
        if (userAccountNoMembership) {
            registerMemberShipType.value = membershipId;
            userAccountNoMembership.id_membership = membershipId;
            registerUserAccount.value = userAccountNoMembership;
        }
    }

    /**
     * Finalizes the registration process by creating all necessary entities.
     * @param card_number - Card number
     * @param month - Expiration month
     * @param year - Expiration year
     * @param cvv - CVV code
     * @param card_type - Type of card (e.g., 'Visa', 'MasterCard')
     * @returns {Promise<void>} - Resolves when registration is complete, rejects on error.
     */
    async function finishRegister({ card_number, month, year, cvv, card_type }) {
        const role = registerMemberShipType.value;
        const user = registerUser.value;
        const userAccount = registerUserAccount.value;
        const location = registerLocation.value;
        const membershipId = userAccount.id_membership;

        if(!role || !user || !userAccount || !location || !membershipId) {
            errors.value.push(new Error('Incomplete registration data'));
            return;
        }

        console.log('🚀 Starting registration process...');
        console.log('Location:', location);
        console.log('User:', user);
        console.log('UserAccount:', userAccount);

        try {
            // 1. Create location first and WAIT for the response
            console.log('📍 Creating location...');
            const createdLocation = await addLocation(location);
            console.log('✅ Location created: ', createdLocation);

            const createdUser = await addUser(user);
            console.log('✅ User created ', createdUser);


            const createdUserAccount = await addUserAccount(userAccount);
            console.log('✅ User account created:', createdUserAccount);

            const newPayment = new Payment({
                id_payment: 'PY0' + (paymentsCount.value + 1).toString(),
                card_number: card_number,
                card_type: card_type,
                month: month,
                year: year,
                cvv: cvv,
                id_user_account: userAccount.id,
            });

            const createdPayment = await addPayment(newPayment);
            console.log('✅ Payment created:', createdPayment);

            console.log('Registration process completed successfully');

        } catch (error) {
            console.error('❌ Registration failed:', error);
            console.error('Error details:', error.response?.data || error.message);
            errors.value.push(error);
        }
    }

    /**
     * Resets the registration flow data.
     * @returns {void}
     */
    function resetRegistrationFlow() {
        registerLocation.value = null;
        registerPayment.value = null;
        registerUser.value = null;
        registerUserAccount.value = null;
        registerMemberShipType.value = null;
        errors.value = [];
    }

    /**
     * Fetches all locations from the API and updates the store.
     * @returns {void}
     */
    function fetchLocations() {
        iamApi.getLocations().then(response => {
            locations.value = LocationAssembler.toEntitiesFromResponse(response);
            locationsLoaded.value = true;
            console.log(locationsLoaded.value);
            console.log(locations.value);
        }).catch(error => {
            errors.value.push(error);
        });
    }

    /**
     * Fetches all payments from the API and updates the store.
     * @returns {void}
     */
    function fetchPayments() {
        iamApi.getPayments().then(response => {
            payments.value = PaymentAssembler.toEntitiesFromResponse(response);
            paymentsLoaded.value = true;
            console.log(paymentsLoaded.value);
            console.log(payments.value);
        }).catch(error => {
            errors.value.push(error);
        });
    }

    /**
     * Fetches all users from the API and updates the store.
     * @returns {void}
     */
    function fetchUsers() {
        iamApi.getUsers().then(response => {
            users.value = UserAssembler.toEntitiesFromResponse(response);
            usersLoaded.value = true;
            console.log(usersLoaded.value);
            console.log(users.value);
        }).catch(error => {
            errors.value.push(error);
        });
    }

    /**
     * Fetches all user accounts from the API and updates the store.
     * @returns {void}
     */
    function fetchUserAccounts() {
        iamApi.getUserAccounts().then(response => {
            userAccounts.value = UserAccountAssembler.toEntitiesFromResponse(response);
            userAccountsLoaded.value = true;
            console.log(userAccountsLoaded.value);
            console.log(userAccounts.value);
        }).catch(error => {
            errors.value.push(error);
        });
    }

    /**
     * Gets a location by its ID.
     * @param id - The ID of the location to retrieve.
     * @returns {Location} - The location with the specified ID, or undefined if not found.
     */
    function getLocationById(id) {
        return locations.value.find(location => location.id === id);
    }

    /**
     * Adds a new location.
     * @param location - The location to add.
     * @returns {Promise} - Promise that resolves with the created location
     */
    function addLocation(location) {
        return new Promise((resolve, reject) => {
            const resource = LocationAssembler.toResourceFromEntity(location);
            iamApi.createLocation(resource).then(response => {
                const responseData = response.data;
                const newLocation = LocationAssembler.toEntityFromResource(responseData);
                locations.value.push(newLocation);
                resolve(newLocation);
            }).catch(error => {
                errors.value.push(error);
                reject(error);
            });
        });
    }

    /**
     * Updates an existing location.
     * @param location - The location to update.
     * @returns {void}
     */
    function updateLocation(location) {
        iamApi.updateLocation(location).then(response => {
            const resource = response.data;
            const updatedLocation = LocationAssembler.toEntityFromResource(resource);
            const index = locations.value.findIndex(loc => loc.id === updatedLocation.id);
            if (index !== -1) locations.value[index] = updatedLocation;
        }).catch(error => {
            errors.value.push(error);
        })
    }

    /**
     * Deletes a location.
     * @param location - The location to delete.
     * @returns {void}
     */
    function deleteLocation(location) {
        iamApi.deleteLocation(location.id).then(() => {
            const index = locations.value.findIndex(loc => loc.id === location.id);
            if (index !== -1) locations.value.splice(index, 1);
        }).catch(error => {
            errors.value.push(error);
        })
    }

    /**
     * Gets a payment by its ID.
     * @param id - The ID of the payment to retrieve.
     * @returns {Payment} - The payment with the specified ID, or undefined if not found.
     */
    function getPaymentById(id) {
        return payments.value.find(payment => payment.id === id);
    }

    /**
     * Adds a new payment.
     * @param payment - The payment to add.
     * @return {Promise} - Promise that resolves with the created payment
     */
    function addPayment(payment) {
        return new Promise((resolve, reject) => {
            const resource = PaymentAssembler.toResourceFromEntity(payment);
            iamApi.createPayment(resource).then(response => {
                const responseData = response.data;
                const newPayment = PaymentAssembler.toEntityFromResource(responseData);
                payments.value.push(newPayment);
                resolve(newPayment);
            }).catch(error => {
                errors.value.push(error);
                reject(error);
            });
        });
    }

    /**
     * Updates an existing payment.
     * @param payment - The payment to update.
     * @return {void}
     */
    function updatePayment(payment) {
        iamApi.updatePayment(payment).then(response => {
            const resource = response.data;
            const updatedPayment = PaymentAssembler.toEntityFromResource(resource);
            const index = payments.value.findIndex(pay => pay.id === updatedPayment.id);
            if (index !== -1) payments.value[index] = updatedPayment;
        }).catch(error => {
            errors.value.push(error);
        })
    }

    /**
     * Deletes a payment.
     * @param payment - The payment to delete.
     * @return {void}
     */
    function deletePayment(payment) {
        iamApi.deletePayment(payment.id).then(() => {
            const index = payments.value.findIndex(pay => pay.id === payment.id);
            if (index !== -1) payments.value.splice(index, 1);
        }).catch(error => {
            errors.value.push(error);
        })
    }

    /**
     * Gets a user by their ID.
     * @param id - The ID of the user to retrieve.
     * @returns {User} - The user with the specified ID, or undefined if not found.
     */
    function getUserById(id) {
        return users.value.find(user => user.id === id);
    }

    /**
     * Adds a new user.
     * @param user - The user to add.
     * @returns {Promise} - Promise that resolves with the created user
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
     * Updates an existing user.
     * @param user - The user to update.
     */
    function updateUser(user) {
        iamApi.updateUser(user).then(response => {
            const resource = response.data;
            const updatedUser = UserAssembler.toEntityFromResource(resource);
            const index = users.value.findIndex(u => u.id === updatedUser.id);
            if (index !== -1) users.value[index] = updatedUser;
        }).catch(error => {
            errors.value.push(error);
        })
    }

    /**
     * Deletes a user.
     * @param user - The user to delete.
     */
    function deleteUser(user) {
        iamApi.deleteUser(user.id).then(() => {
            const index = users.value.findIndex(u => u.id === user.id);
            if (index !== -1) users.value.splice(index, 1);
        }).catch(error => {
            errors.value.push(error);
        })
    }

    /**
     * Gets a user account by its ID.
     * @param id - The ID of the user account to retrieve.
     * @returns {UserAccount} - The user account with the specified ID, or undefined if not found.
     */
    function getUserAccountById(id) {
        return userAccounts.value.find(account => account.id === id);
    }

    /**
     * Adds a new user account.
     * @param userAccount - The user account to add.
     * @return {Promise} - Promise that resolves with the created user account
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
     * Updates an existing user account.
     * @param userAccount - The user account to update.
     * @return {void}
     */
    function updateUserAccount(userAccount) {
        iamApi.updateUserAccount(userAccount).then(response => {
            const resource = response.data;
            const updatedUserAccount = UserAccountAssembler.toEntityFromResource(resource);
            const index = userAccounts.value.findIndex(acc => acc.id === updatedUserAccount.id);
            if (index !== -1) userAccounts.value[index] = updatedUserAccount;
        }).catch(error => {
            errors.value.push(error);
        })
    }

    /**
     * Deletes a user account.
     * @param userAccount - The user account to delete.
     * @return {void}
     */
    function deleteUserAccount(userAccount) {
        iamApi.deleteUserAccount(userAccount.id).then(() => {
            const index = userAccounts.value.findIndex(acc => acc.id === userAccount.id);
            if (index !== -1) userAccounts.value.splice(index, 1);
        }).catch(error => {
            errors.value.push(error);
        })
    }


    return {
        locations,
        payments,
        users,
        userAccounts,
        errors,
        locationsLoaded,
        paymentsLoaded,
        usersLoaded,
        userAccountsLoaded,
        locationsCount,
        paymentsCount,
        usersCount,
        userAccountsCount,
        sessionUserAccount,
        sessionUser,
        isAuthenticated,
        roleId,
        registerLocation,
        registerPayment,
        registerUser,
        registerUserAccount,
        registerMemberShipType,
        loadSessionFromStorage,
        login,
        logout,
        clearSession,
        getAccessToken,
        startRegistrationFlow,
        saveRegisterOwner,
        saveRegisterWorkshop,
        selectPlan,
        finishRegister,
        resetRegistrationFlow,
        fetchLocations,
        fetchPayments,
        fetchUsers,
        fetchUserAccounts,
        getLocationById,
        addLocation,
        updateLocation,
        deleteLocation,
        getPaymentById,
        addPayment,
        updatePayment,
        deletePayment,
        getUserById,
        addUser,
        updateUser,
        deleteUser,
        getUserAccountById,
        addUserAccount,
        updateUserAccount,
        deleteUserAccount
    };
})

export default useIamStore;

