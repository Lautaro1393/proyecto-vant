// Coords picker: mapa Leaflet + input de texto + boton geolocation
// Recibe el id del contenedor donde se monta y callbacks para cambio de valor

const COORDS_REGEX_LOCAL = /^-?\d{1,3}\.?\d*,-?\d{1,3}\.?\d*$/;

const parseCoords = (str) => {
  if (!str || !COORDS_REGEX_LOCAL.test(str)) return null;
  const [lat, lng] = str.split(",").map((s) => Number(s.trim()));
  if (Number.isNaN(lat) || Number.isNaN(lng)) return null;
  if (lat < -90 || lat > 90 || lng < -180 || lng > 180) return null;
  return { lat, lng };
};

const formatCoords = (lat, lng) => {
  const round = (n) => Math.round(n * 1000000) / 1000000;
  return `${round(lat)},${round(lng)}`;
};

const escape = (s) => String(s ?? "").replace(/[&<>"']/g, (c) => ({"&":"&amp;","<":"&lt;",">":"&gt;","\"":"&quot;","'":"&#39;"}[c]));

export const mountCoordsPicker = ({ container, initial = "", onChange }) => {
  if (!container) throw new Error("mountCoordsPicker: container requerido");
  if (typeof window.L === "undefined") {
    container.innerHTML = `<div class="card__body error-banner">Leaflet no se cargo. Verifica la conexion a internet.</div>`;
    return { destroy: () => {} };
  }

  const initialParsed = parseCoords(initial) || { lat: -34.6037, lng: -58.3816 };

  container.innerHTML = `
    <div class="coords-picker">
      <div class="coords-picker__map" data-map></div>
      <p class="coords-picker__hint">CLICK EN EL MAPA O ARRASTRA EL PIN PARA UBICAR EL VUELO</p>
      <div class="coords-picker__row">
        <div class="input-wrap" style="flex:1">
          <input class="input" type="text" data-input value="${escape(initial)}" placeholder="-34.6037,-58.3816" pattern="^-?\\d{1,3}\\.?\\d*,-?\\d{1,3}\\.?\\d*$" autocomplete="off" />
          <div class="input-wrap__brackets">
            <span class="br-tl"></span><span class="br-tr"></span>
            <span class="br-bl"></span><span class="br-br"></span>
          </div>
        </div>
        <button class="btn btn--secondary" type="button" data-geo title="Usar mi ubicacion actual">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="18" height="18" style="vertical-align:-3px;margin-right:4px">
            <circle cx="12" cy="12" r="3"/><line x1="12" y1="2" x2="12" y2="5"/><line x1="12" y1="19" x2="12" y2="22"/><line x1="2" y1="12" x2="5" y2="12"/><line x1="19" y1="12" x2="22" y2="12"/>
          </svg>MI UBIC.
        </button>
      </div>
      <div class="coords-picker__error" data-error style="display:none"></div>
    </div>
  `;

  const mapEl = container.querySelector("[data-map]");
  const inputEl = container.querySelector("[data-input]");
  const btnGeo = container.querySelector("[data-geo]");
  const errEl = container.querySelector("[data-error]");

  const map = window.L.map(mapEl, { zoomControl: true }).setView([initialParsed.lat, initialParsed.lng], initial ? 14 : 4);
  window.L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
    maxZoom: 19,
    attribution: "© OpenStreetMap contributors",
  }).addTo(map);

  const marker = window.L.marker([initialParsed.lat, initialParsed.lng], { draggable: true }).addTo(map);

  const showError = (msg) => {
    if (msg) {
      errEl.textContent = msg;
      errEl.style.display = "block";
    } else {
      errEl.textContent = "";
      errEl.style.display = "none";
    }
  };

  const emit = (val, source) => {
    showError("");
    if (typeof onChange === "function") onChange(val, source);
  };

  const setMarker = (lat, lng, source) => {
    marker.setLatLng([lat, lng]);
    const value = formatCoords(lat, lng);
    inputEl.value = value;
    emit(value, source);
  };

  const flyTo = (lat, lng, zoom = 14) => {
    map.flyTo([lat, lng], zoom, { duration: 0.6 });
  };

  marker.on("dragend", () => {
    const { lat, lng } = marker.getLatLng();
    setMarker(lat, lng, "marker");
  });

  map.on("click", (e) => {
    const { lat, lng } = e.latlng;
    setMarker(lat, lng, "map");
  });

  inputEl.addEventListener("input", () => {
    const parsed = parseCoords(inputEl.value);
    if (parsed) {
      marker.setLatLng([parsed.lat, parsed.lng]);
      flyTo(parsed.lat, parsed.lng, Math.max(map.getZoom(), 13));
      showError("");
      emit(inputEl.value, "input");
    } else if (inputEl.value === "") {
      showError("");
      emit("", "input");
    } else {
      showError("Formato invalido (debe ser lat,lng)");
    }
  });

  btnGeo.addEventListener("click", () => {
    if (!navigator.geolocation) {
      showError("Geolocalizacion no disponible en este navegador");
      return;
    }
    btnGeo.disabled = true;
    const originalText = btnGeo.innerHTML;
    btnGeo.innerHTML = "BUSCANDO...";
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const lat = pos.coords.latitude;
        const lng = pos.coords.longitude;
        setMarker(lat, lng, "geo");
        flyTo(lat, lng, 16);
        btnGeo.disabled = false;
        btnGeo.innerHTML = originalText;
      },
      (err) => {
        showError(`No se pudo obtener ubicacion: ${err.message}`);
        btnGeo.disabled = false;
        btnGeo.innerHTML = originalText;
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 60000 }
    );
  });

  setTimeout(() => map.invalidateSize(), 100);

  return {
    getValue: () => inputEl.value,
    setValue: (val) => {
      const parsed = parseCoords(val);
      if (parsed) {
        marker.setLatLng([parsed.lat, parsed.lng]);
        inputEl.value = formatCoords(parsed.lat, parsed.lng);
        flyTo(parsed.lat, parsed.lng, 14);
      } else {
        inputEl.value = val || "";
      }
    },
    destroy: () => {
      map.remove();
      container.innerHTML = "";
    },
  };
};
