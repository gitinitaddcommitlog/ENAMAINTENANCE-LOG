const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('api', {
    db: {
        getVehicles: () => ipcRenderer.invoke('db:getVehicles'),
        addVehicle: (data) => ipcRenderer.invoke('db:addVehicle', data),
        updateVehicle: (id, data) => ipcRenderer.invoke('db:updateVehicle', id, data),
        deleteVehicle: (id) => ipcRenderer.invoke('db:deleteVehicle', id),
        getMechanics: () => ipcRenderer.invoke('db:getMechanics'),
        getLogs: () => ipcRenderer.invoke('db:getLogs')
    },
    auth: {
        login: (username, password) => ipcRenderer.invoke('auth:login', username, password),
        logout: () => ipcRenderer.invoke('auth:logout'),
        getCurrentUser: () => ipcRenderer.invoke('auth:getCurrentUser')
    }
});
