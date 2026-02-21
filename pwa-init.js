// PWA Initialization
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/service-worker.js')
      .then((registration) => {
        console.log('✅ Service Worker đã đăng ký:', registration.scope);
      })
      .catch((error) => {
        console.log('❌ Lỗi đăng ký Service Worker:', error);
      });
  });
}

// Install prompt
let deferredPrompt;
const installButton = document.getElementById('installButton');

window.addEventListener('beforeinstallprompt', (e) => {
  console.log('💡 Có thể cài đặt app');
  e.preventDefault();
  deferredPrompt = e;
  
  // Show install button if exists
  if (installButton) {
    installButton.style.display = 'block';
  }
  
  // Show toast notification
  showInstallPrompt();
});

function showInstallPrompt() {
  const toast = document.createElement('div');
  toast.className = 'install-toast';
  toast.innerHTML = `
    <div class="install-toast-content">
      <span>📱 Cài đặt app N5K2 để sử dụng offline!</span>
      <button onclick="installApp()" class="install-toast-btn">Cài đặt</button>
      <button onclick="closeInstallToast()" class="install-toast-close">✕</button>
    </div>
  `;
  document.body.appendChild(toast);
  
  setTimeout(() => {
    toast.classList.add('show');
  }, 1000);
}

window.installApp = async function() {
  if (!deferredPrompt) {
    console.log('Không thể cài đặt app');
    return;
  }
  
  deferredPrompt.prompt();
  const { outcome } = await deferredPrompt.userChoice;
  
  console.log(`User response: ${outcome}`);
  
  if (outcome === 'accepted') {
    console.log('✅ User đã cài đặt app');
  } else {
    console.log('❌ User từ chối cài đặt');
  }
  
  deferredPrompt = null;
  closeInstallToast();
}

window.closeInstallToast = function() {
  const toast = document.querySelector('.install-toast');
  if (toast) {
    toast.classList.remove('show');
    setTimeout(() => toast.remove(), 300);
  }
}

// Detect if app is installed
window.addEventListener('appinstalled', () => {
  console.log('✅ App đã được cài đặt');
  closeInstallToast();
});

// Check if running as PWA
function isPWA() {
  return window.matchMedia('(display-mode: standalone)').matches || 
         window.navigator.standalone === true;
}

if (isPWA()) {
  console.log('🚀 Đang chạy như PWA');
  document.body.classList.add('pwa-mode');
}
