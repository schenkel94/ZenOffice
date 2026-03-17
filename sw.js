const CACHE_NAME = 'zenoffice-master-v5';
const urlsToCache = [
  './',
  './index.html',
  './manifest.json',
  './icon.png',
  './qr.png',
  './profile.png',
  './alarme.mp3',
  './bubble.mp3',
  './foco.mp3',
  './natureza.mp3',
  './lo-fi.mp3',
  './notify.mp3'
];

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('Cache aberto: Baixando todos os arquivos...');
        return cache.addAll(urlsToCache);
      })
  );
});

self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request)
      .then(response => {
        // Retorna do cache se existir
        if (response) {
          return response;
        }
        // Se não, busca na rede
        return fetch(event.request);
      })
  );
});

// Remove caches antigos ao atualizar a versão
self.addEventListener('activate', event => {
  const cacheWhitelist = [CACHE_NAME];
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          if (cacheWhitelist.indexOf(cacheName) === -1) {
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
});

// Escutar mensagens do app
self.addEventListener('message', event => {
  console.log('SW recebeu mensagem:', event.data);
  
  if (event.data.type === 'SHOW_NOTIFICATION') {
    const task = event.data.task;
    
    console.log('Tentando mostrar notificação para tarefa:', task);
    
    // Mostrar notificação com actions
    const notificationOptions = {
      body: task.text,
      icon: 'icon.png',
      badge: 'icon.png',
      tag: `task-${task.id}`,
      requireInteraction: true,
      vibrate: [200, 100, 200],
      actions: [
        { 
          action: 'complete', 
          title: '✓ Finalizar',
          icon: 'icon.png'
        },
        { 
          action: 'snooze', 
          title: `⏰ Adiar ${task.snooze}min`,
          icon: 'icon.png'
        }
      ],
      data: { 
        taskId: task.id,
        snooze: task.snooze 
      }
    };
    
    self.registration.showNotification('ZenOffice - Lembrete', notificationOptions)
      .then(() => console.log('Notificação exibida com sucesso'))
      .catch(err => console.error('Erro ao exibir notificação:', err));
  }
});

// Escutar cliques nas notificações
self.addEventListener('notificationclick', event => {
  console.log('Clique na notificação:', event.action);
  
  event.notification.close();
  
  const action = event.action;
  const taskId = event.notification.data.taskId;
  
  // Enviar mensagem para o app com a ação escolhida
  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then(clientList => {
      console.log('Clientes encontrados:', clientList.length);
      
      if (clientList.length > 0) {
        clientList.forEach(client => {
          client.postMessage({
            type: 'TASK_ACTION',
            taskId: taskId,
            action: action || 'complete'
          });
        });
      } else {
        // Se não há clientes abertos, abrir o app
        clients.openWindow('/');
      }
    })
  );
});
