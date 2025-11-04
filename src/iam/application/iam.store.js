import {IamApi} from "@/iam/infrastructure/iam-api.js";
import {defineStore} from "pinia";
import {computed, ref} from "vue";
import {UserAccountAssembler} from "@/iam/infrastructure/user-account.assembler.js";
import {UserAssembler} from "@/iam/infrastructure/user.assembler.js";
import {LocationAssembler} from "@/auto-repair-catalog/infrastructure/location.assembler.js";
import {PaymentAssembler} from "@/payment-service/infrastructure/payment.assembler.js";
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

const iamApi = new IamApi();

export const useIamStore = defineStore('iam', () => {

    const catalogStore = useCatalogStore();
    const paymentStore = usePaymentStore();

    const userAccounts = ref([]);
    const users = ref([]);

    const locations = computed(() => catalogStore.locations);
    const payments = computed(() => paymentStore.payments);

    const loading = ref(false);
    const errors = ref([]);

    const sessionUserAccount = ref(null);
    const sessionUser = ref(null);

    const userAccountsLoaded =ref(false);
    const userLoaded = ref(false);

    const registerUser = ref(null);
    const registerUserAccount = ref(null);
    const registerPayment = ref(null);
    const registerRole = ref(null);
    const registerLocation = ref(null);
    const registerMemberShipType = ref(null);

    const userAccountCount = computed(() => {
        return userAccountsLoaded ? userAccounts.value.length:0;
    })

    const userCount = computed(() => {
        return userLoaded ? users.value.length:0;
    })

    const paymentCount = computed(() => {
        this.payments().length;
    })

    const locationCount = computed(() => {
        this.locations().length;
    })

    const isAuthenticated = computed(() => !!sessionUserAccount.value);
    const roleId = computed(() => sessionUserAccount.value?.id_role ?? '');
    const fullName = computed(() => {
        const user = sessionUser.value;
        return user ? `${user.name} ${user.last_name}` : '';
    });

    function formatError(err, fallback) {
        if (err instanceof Error) {
            return err.message.includes('Resource not found') ? `${fallback}: No encontrado` : err.message;
        }
        const apiError = err?.response?.data?.message || err?.message;
        return apiError || fallback;
    }

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
    function clearSessionStorage() {
        if (typeof localStorage === 'undefined') return;

        try {
            localStorage.removeItem('prime-fix-session');
        } catch (err) {
            console.warn('Failed to clear session from localStorage:', err);
        }
    }
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
                    // Re-instanciar las entidades
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

    function fetchUserAccounts() {
        iamApi.getUserAccounts().then(response =>{
            userAccounts.value = UserAccountAssembler.toEntitiesFromResponse(response);
            userAccountsLoaded.value = true;
        }).catch(error=>{
          errors.value.push(error);
        })
    }
    function fetchUsers() {
        iamApi.getUsers().then(response =>{
            users.value = UserAssembler.toEntitiesFromResponse(response);
            userLoaded.value = true;
        }).catch(error=>{
            errors.value.push(error);
        })
    }

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
    function logout() {
        sessionUserAccount.value = null;
        sessionUser.value = null;
        clearSessionStorage();
        console.log('Logout successful');
    }

    function getUserById(id) {
        return users.value.find(u => u.id_user === id);
    }
    function getUserAccountById(id) {
        return userAccounts.value.find(ua => ua.id_user_account === id);
    }
    function getLocationById(id) {
        return catalogStore.getLocationById(id);
    }

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

    function addLocation(location) {
        return catalogStore.addLocation(location);
    }
    function updateLocation(location) {
        catalogStore.updateLocation(location.id_location, location);
    }
    function deleteLocation(id) {
        catalogStore.deleteLocation(id);
    }

    function addPayment(payment) {
        return paymentStore.addPayment(payment);
    }
    function updatePayment(updatedPayment) {
        paymentStore.updatePayment(updatedPayment);
    }
    function deletePayment(id) {
        paymentStore.deletePayment(id);
    }

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
        // Asignar el nombre legible del rol
        registerRole.value = RoleChoicesType.VEHICLE_OWNER;
    }
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

    function resetRegistrationFlow() {
        registerRole.value = null;
        registerUser.value = null;
        registerUserAccount.value = null;
        registerPayment.value = null;
        registerLocation.value = null;
        registerMemberShipType.value = null;
        errors.value = null;
    }

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
        loadSessionFromStorage
    };
});

export default useIamStore;
