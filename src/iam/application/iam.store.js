import {IamApi} from "@/iam/infrastructure/iam-api.js";
import {defineStore} from "pinia";
import {computed, ref} from "vue";
import {LocationAssembler} from "@/iam/infrastructure/location.assembler.js";
import {PaymentAssembler} from "@/iam/infrastructure/payment.assembler.js";
import {UserAccountAssembler} from "@/iam/infrastructure/user-account.assembler.js";
import {UserAssembler} from "@/iam/infrastructure/user.assembler.js";

const iamApi = new IamApi();

const useIamStore = defineStore('iam', () => {
    const locations = ref([]);
    const payments = ref([]);
    const users = ref([]);
    const userAccounts = ref([]);

    const errors = ref([]);


    const locationsLoaded = ref(false);
    const paymentsLoaded = ref(false);
    const usersLoaded = ref(false);
    const userAccountsLoaded = ref(false);

    const locationsCount = computed(() => {
        return locationsLoaded ? locations.value.length : 0;
    });

    const paymentsCount = computed(() => {
        return paymentsLoaded ? payments.value.length : 0;
    });

    const usersCount = computed(() => {
        return usersLoaded ? users.value.length : 0;
    });

    const userAccountsCount = computed(() => {
        return userAccountsLoaded ? userAccounts.value.length : 0;
    });

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

    function getLocationById(id) {
        return locations.value.find(location => location.id === id);
    }

    function addLocation(location) {
        iamApi.createLocation(location).then(response => {
            const resource = response.data;
            const newLocation = LocationAssembler.toEntityFromResource(resource);
            locations.value.push(newLocation);
        }).catch(error => {
            errors.value.push(error);
        })
    }

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

    function deleteLocation(location) {
        iamApi.deleteLocation(location.id).then(() => {
            const index = locations.value.findIndex(loc => loc.id === location.id);
            if (index !== -1) locations.value.splice(index, 1);
        }).catch(error => {
            errors.value.push(error);
        })
    }

    function getPaymentById(id) {
        return payments.value.find(payment => payment.id === id);
    }

    function addPayment(payment) {
        iamApi.createPayment(payment).then(response => {
            const resource = response.data;
            const newPayment = PaymentAssembler.toEntityFromResource(resource);
            payments.value.push(newPayment);
        }).catch(error => {
            errors.value.push(error);
        })
    }

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

    function deletePayment(payment) {
        iamApi.deletePayment(payment.id).then(() => {
            const index = payments.value.findIndex(pay => pay.id === payment.id);
            if (index !== -1) payments.value.splice(index, 1);
        }).catch(error => {
            errors.value.push(error);
        })
    }

    function getUserById(id) {
        return users.value.find(user => user.id === id);
    }

    function addUser(user) {
        iamApi.createUser(user).then(response => {
            const resource = response.data;
            const newUser = UserAssembler.toEntityFromResource(resource);
            users.value.push(newUser);
        }).catch(error => {
            errors.value.push(error);
        })
    }

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

    function deleteUser(user) {
        iamApi.deleteUser(user.id).then(() => {
            const index = users.value.findIndex(u => u.id === user.id);
            if (index !== -1) users.value.splice(index, 1);
        }).catch(error => {
            errors.value.push(error);
        })
    }

    function getUserAccountById(id) {
        return userAccounts.value.find(account => account.id === id);
    }

    function addUserAccount(userAccount) {
        iamApi.createUserAccount(userAccount).then(response => {
            const resource = response.data;
            const newUserAccount = UserAccountAssembler.toEntityFromResource(resource);
            userAccounts.value.push(newUserAccount);
        }).catch(error => {
            errors.value.push(error);
        })
    }

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