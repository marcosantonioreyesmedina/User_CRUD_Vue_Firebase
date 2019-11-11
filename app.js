// Configuracion previa para conectarse a Firebase


const config = {
    apiKey: '',
    authDomain: '',
    databaseURL: '',
    projectId: '',
    storageBucket: '',
    messagingSenderId: '',
    appId: ''
};

// Inicializando la App

firebase.initializeApp(config);

// Obtengo la referencia a la BD

const database = firebase.database();

Vue.use(Toasted, {
    iconPack: 'fontawesome',
    position: 'top-center',
    duration: 3000
});

const app = new Vue({
    el: '#app',
    data: {
        editing: false,
        showPass: false,
        allowUpdate: false,
        filter: '',
        newUser: {},
        userList: []
    },
    created: function () {
        database.ref('/users')
            .on('value', snapshot => this.loadUser(snapshot.val()))
            .then(() => console.info(this.userList));
    },
    computed: {
        filterUser() {
            return this.userList.filter((value) => {
                return value.name.toLowerCase().includes(this.filter.toLowerCase()) ||
                    value.lastname.toLowerCase().includes(this.filter.toLowerCase()) ||
                    value.email.toLowerCase().includes(this.filter.toLowerCase());
            });
        }
    },
    methods: {
        loadUser(users) {
            this.userList = [];
            for (let key in users) {
                this.userList.push({
                    key,
                    name: users[key].name,
                    lastname: users[key].lastname,
                    email: users[key].email,
                    pass: users[key].pass
                });
            }
        },
        addOrUpdateUser() {
            let userPath = this.getUser(this.newUser.email);
            let usuario = this.newUser.name;
            // Escribo en la base de datos
            database.ref(`/users/${userPath}`)
                .set({
                    name: this.newUser.name,
                    lastname: this.newUser.lastname,
                    email: this.newUser.email,
                    pass: this.newUser.pass
                })
                .then(() => {
                    if (this.editing) {
                        this.$toasted.success(`El usuario: '${ usuario }' se ha actualizado satisfactoriamente`, {
                            icon: 'check'
                        });
                        this.reset(true);
                    } else {
                        this.$toasted.success(`El usuario: '${ usuario }' se ha insertado satisfactoriamente`, {
                            icon: 'check'
                        });
                        this.reset(false);
                    }
                });

        },
        deleteUser(email) {
            let user = this.getUser(email);
            let message = `Está seguro de eliminar el usuario ${user}`;
            if (confirm(message)) {
                database.ref('users').child(user)
                    .set(null)
                    .then(() => {
                        this.$toasted.success(`El usuario: '${ user }' se ha eliminado satisfactoriamente`, {
                            icon: 'check'
                        });
                    });
            }
        },
        editUser(user) {
            this.newUser = user;
            this.editing = true;
        },
        getUser(email) {
            let user = email.split('@')[0];
            let re = /\./gi;
            user = user.replace(re, "");
            return user;
        },
        reset(cleanAll) {
            if (cleanAll) {
                this.editing = false;
                this.showPass = false;
                this.allowUpdate = false;
            }
            this.newUser = {};
        }
    }

});
