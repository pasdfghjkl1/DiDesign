import sounddevice as sd
import numpy as np
import threading
import tkinter as tk
from tkinter import ttk
from ctypes import cast, POINTER
from comtypes import CLSCTX_ALL
from pycaw.pycaw import AudioUtilities, IAudioEndpointVolume
import time

class AutoVolumeControl:
    def __init__(self):
        self.running = False
        self.target_volume = 0.5  # Целевая громкость (0-1)
        self.sensitivity = 0.3  # Чувствительность (насколько быстро реагировать)
        self.min_db_threshold = -60  # Минимальный порог звука (тишина)
        
        # Инициализация управления громкостью Windows
        devices = AudioUtilities.GetSpeakers()
        interface = devices.Activate(IAudioEndpointVolume._iid_, CLSCTX_ALL, None)
        self.volume = cast(interface, POINTER(IAudioEndpointVolume))
        
        # Параметры аудио
        self.CHUNK = 2048
        self.RATE = 44100
        
        # Для отображения текущего уровня
        self.current_db = -100
        self.current_system_volume = 0.5
        
    def calculate_db(self, audio_data):
        """Вычислить уровень звука в dB"""
        if len(audio_data) == 0:
            return -100
        
        # RMS (Root Mean Square)
        rms = np.sqrt(np.mean(np.square(audio_data.astype(np.float64))))
        
        if rms > 0:
            db = 20 * np.log10(rms)
        else:
            db = -100
            
        return db
    
    def normalize_db_to_volume(self, db):
        """Преобразовать dB в относительную громкость (0-1)"""
        # Диапазон от -60 dB (тихо) до -10 dB (громко)
        if db < -60:
            return 0.0
        elif db > -10:
            return 1.0
        else:
            # Линейная нормализация
            return (db + 60) / 50.0
    
    def adjust_volume(self, current_db):
        """Автоматическая регулировка громкости"""
        self.current_db = current_db
        
        # Если звук слишком тихий (тишина), не меняем громкость
        if current_db < self.min_db_threshold:
            return
        
        # Преобразуем текущий уровень звука в относительную громкость
        perceived_loudness = self.normalize_db_to_volume(current_db)
        
        # Получаем текущую системную громкость
        current_sys_vol = self.volume.GetMasterVolumeLevelScalar()
        self.current_system_volume = current_sys_vol
        
        # Вычисляем, насколько нужно изменить громкость
        loudness_diff = perceived_loudness - self.target_volume
        
        # Применяем коррекцию с учетом чувствительности
        adjustment = -loudness_diff * self.sensitivity * 0.1
        
        new_vol = current_sys_vol + adjustment
        
        # Ограничиваем диапазон
        new_vol = max(0.01, min(1.0, new_vol))
        
        # Устанавливаем новую громкость
        self.volume.SetMasterVolumeLevelScalar(new_vol, None)
    
    def audio_callback(self, indata, frames, time_info, status):
        """Callback для обработки аудио данных"""
        if status:
            print(f"Статус: {status}")
        
        # Берем только один канал
        audio_mono = indata[:, 0] if len(indata.shape) > 1 else indata
        
        db_level = self.calculate_db(audio_mono)
        self.adjust_volume(db_level)
    
    def start_monitoring(self):
        """Запуск мониторинга"""
        self.running = True
        
        try:
            # Получаем устройство записи по умолчанию
            device_info = sd.query_devices(kind='input')
            print(f"Используется микрофон: {device_info['name']}")
            
            # Запускаем поток записи
            with sd.InputStream(callback=self.audio_callback, 
                               channels=1,
                               samplerate=self.RATE,
                               blocksize=self.CHUNK):
                while self.running:
                    time.sleep(0.1)
                    
        except Exception as e:
            print(f"Ошибка: {e}")
            self.running = False
    
    def stop_monitoring(self):
        """Остановка мониторинга"""
        self.running = False
    
    def cleanup(self):
        """Очистка ресурсов"""
        self.stop_monitoring()


class VolumeControlGUI:
    def __init__(self, root):
        self.root = root
        self.root.title("Автоматическая регулировка громкости")
        self.root.geometry("550x500")
        self.root.resizable(False, False)
        self.root.configure(bg="#f0f0f0")
        
        self.controller = AutoVolumeControl()
        self.monitoring_thread = None
        
        self.setup_ui()
        self.root.protocol("WM_DELETE_WINDOW", self.on_closing)
        
    def setup_ui(self):
        # Заголовок
        header_frame = tk.Frame(self.root, bg="#2196F3", height=60)
        header_frame.pack(fill="x")
        header_frame.pack_propagate(False)
        
        title_label = tk.Label(header_frame, text="🔊 Автоматическая регулировка громкости", 
                              font=("Arial", 16, "bold"), bg="#2196F3", fg="white")
        title_label.pack(expand=True)
        
        # Главный контейнер
        main_frame = tk.Frame(self.root, bg="#f0f0f0")
        main_frame.pack(padx=20, pady=20, fill="both", expand=True)
        
        # Оптимальная громкость (главный параметр)
        optimal_frame = tk.LabelFrame(main_frame, text="Желаемая громкость", 
                                     font=("Arial", 12, "bold"), 
                                     bg="#f0f0f0", padx=15, pady=15)
        optimal_frame.pack(fill="x", pady=(0, 15))
        
        tk.Label(optimal_frame, text="Установите комфортный уровень громкости:", 
                bg="#f0f0f0", font=("Arial", 10)).pack(anchor="w", pady=(0, 10))
        
        # Большой ползунок для оптимальной громкости
        slider_frame = tk.Frame(optimal_frame, bg="#f0f0f0")
        slider_frame.pack(fill="x")
        
        tk.Label(slider_frame, text="Тихо", bg="#f0f0f0", fg="gray").pack(side="left")
        
        self.optimal_scale = tk.Scale(slider_frame, from_=0, to=100, orient="horizontal",
                                     length=300, command=self.update_optimal,
                                     bg="#f0f0f0", highlightthickness=0,
                                     sliderlength=30, width=20)
        self.optimal_scale.set(50)
        self.optimal_scale.pack(side="left", padx=10, expand=True, fill="x")
        
        tk.Label(slider_frame, text="Громко", bg="#f0f0f0", fg="gray").pack(side="left")
        
        self.optimal_label = tk.Label(optimal_frame, text="50%", 
                                     font=("Arial", 24, "bold"), 
                                     bg="#f0f0f0", fg="#2196F3")
        self.optimal_label.pack(pady=10)
        
        # Дополнительные настройки
        advanced_frame = tk.LabelFrame(main_frame, text="Дополнительные настройки", 
                                      font=("Arial", 10), 
                                      bg="#f0f0f0", padx=15, pady=10)
        advanced_frame.pack(fill="x", pady=(0, 15))
        
        # Чувствительность
        tk.Label(advanced_frame, text="Скорость реакции:", bg="#f0f0f0").grid(row=0, column=0, sticky="w", pady=5)
        self.sensitivity_scale = tk.Scale(advanced_frame, from_=1, to=10, orient="horizontal",
                                        length=200, command=self.update_sensitivity,
                                        bg="#f0f0f0", highlightthickness=0)
        self.sensitivity_scale.set(3)
        self.sensitivity_scale.grid(row=0, column=1, padx=10)
        self.sensitivity_label = tk.Label(advanced_frame, text="Средняя", bg="#f0f0f0")
        self.sensitivity_label.grid(row=0, column=2)
        
        # Статус и мониторинг
        status_frame = tk.LabelFrame(main_frame, text="Статус мониторинга", 
                                    font=("Arial", 10), 
                                    bg="#f0f0f0", padx=15, pady=10)
        status_frame.pack(fill="x", pady=(0, 15))
        
        status_inner = tk.Frame(status_frame, bg="#f0f0f0")
        status_inner.pack(fill="x")
        
        self.status_indicator = tk.Label(status_inner, text="⚫", 
                                        font=("Arial", 20), bg="#f0f0f0")
        self.status_indicator.pack(side="left", padx=(0, 10))
        
        status_text_frame = tk.Frame(status_inner, bg="#f0f0f0")
        status_text_frame.pack(side="left", fill="x", expand=True)
        
        self.status_label = tk.Label(status_text_frame, text="Остановлено", 
                                     font=("Arial", 12, "bold"), 
                                     bg="#f0f0f0", fg="red", anchor="w")
        self.status_label.pack(anchor="w")
        
        self.db_label = tk.Label(status_text_frame, text="Уровень звука: -- dB", 
                                font=("Arial", 9), bg="#f0f0f0", fg="gray", anchor="w")
        self.db_label.pack(anchor="w")
        
        self.volume_label = tk.Label(status_text_frame, text="Системная громкость: 50%", 
                                    font=("Arial", 9), bg="#f0f0f0", fg="gray", anchor="w")
        self.volume_label.pack(anchor="w")
        
        # Кнопки управления
        button_frame = tk.Frame(main_frame, bg="#f0f0f0")
        button_frame.pack(pady=10)
        
        self.start_button = tk.Button(button_frame, text="▶  ЗАПУСТИТЬ", 
                                      command=self.start_monitoring,
                                      bg="#4CAF50", fg="white",
                                      font=("Arial", 12, "bold"),
                                      width=15, height=2,
                                      relief="flat", cursor="hand2")
        self.start_button.pack(side="left", padx=5)
        
        self.stop_button = tk.Button(button_frame, text="⏹  ОСТАНОВИТЬ",
                                     command=self.stop_monitoring,
                                     bg="#f44336", fg="white",
                                     font=("Arial", 12, "bold"),
                                     width=15, height=2,
                                     relief="flat", cursor="hand2",
                                     state="disabled")
        self.stop_button.pack(side="left", padx=5)
        
        # Информация
        info_label = tk.Label(main_frame, 
                             text="Микрофон: Устройство по умолчанию (Fifine)",
                             font=("Arial", 9), bg="#f0f0f0", fg="gray")
        info_label.pack(pady=(10, 0))
        
    def update_optimal(self, value):
        """Обновление целевой громкости"""
        volume_percent = int(value)
        self.controller.target_volume = volume_percent / 100.0
        self.optimal_label.config(text=f"{volume_percent}%")
    
    def update_sensitivity(self, value):
        """Обновление чувствительности"""
        sens_value = int(value)
        self.controller.sensitivity = sens_value / 10.0
        
        if sens_value <= 3:
            label = "Медленная"
        elif sens_value <= 6:
            label = "Средняя"
        else:
            label = "Быстрая"
        
        self.sensitivity_label.config(text=label)
    
    def start_monitoring(self):
        """Запуск мониторинга"""
        self.start_button.config(state="disabled")
        self.stop_button.config(state="normal")
        self.status_label.config(text="Активно", fg="green")
        self.status_indicator.config(text="🟢")
        
        self.monitoring_thread = threading.Thread(target=self.controller.start_monitoring, daemon=True)
        self.monitoring_thread.start()
        
        self.update_status_display()
    
    def stop_monitoring(self):
        """Остановка мониторинга"""
        self.controller.stop_monitoring()
        self.start_button.config(state="normal")
        self.stop_button.config(state="disabled")
        self.status_label.config(text="Остановлено", fg="red")
        self.status_indicator.config(text="⚫")
    
    def update_status_display(self):
        """Обновление отображения статуса"""
        if self.controller.running:
            db = self.controller.current_db
            if db > -100:
                self.db_label.config(text=f"Уровень звука: {db:.1f} dB")
            else:
                self.db_label.config(text="Уровень звука: Тишина")
            
            volume_percent = int(self.controller.current_system_volume * 100)
            self.volume_label.config(text=f"Системная громкость: {volume_percent}%")
            
            self.root.after(100, self.update_status_display)
    
    def on_closing(self):
        """Закрытие приложения"""
        self.controller.cleanup()
        self.root.destroy()


if __name__ == "__main__":
    root = tk.Tk()
    app = VolumeControlGUI(root)
    root.mainloop()
