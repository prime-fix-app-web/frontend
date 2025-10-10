<script setup>

import {useI18n} from "vue-i18n";


const {t} = useI18n();

</script>

<template>
  <header class="main-header">
    <h1>Gestión de Visita</h1>
  </header>

  <div class="workshop-form-container">
    <h2 class="form-title">Registrar Visita</h2>

    <div class="form-card">
      <form>
        <div class="form-group">
          <label class="form-label">Modelo del Vehículo</label>
          <pv-cascade
              placeholder="Selecciona un vehículo"
              optionLabel="model"
              class="full-width"
          />
        </div>

        <div class="form-group">
          <label class="form-label">Falla Reportada</label>
          <pv-textarea
              placeholder="Describe la falla"
              rows="3"
              autoResize
              class="full-width"
          />
        </div>

        <div class="form-group">
          <label class="form-label">Tipo de Servicio</label>
          <pv-cascade
              placeholder="Selecciona el servicio"
              optionLabel="name"
              class="full-width"
          />
        </div>

        <div class="date-time-row">
          <div class="form-group half-width">
            <label class="form-label">Fecha </label>
            <pv-floatlabel><!--v-model="value1"-->
              <pv-datepicker class="custom-d">
                <label>Over Label</label>
              </pv-datepicker>
            </pv-floatlabel>
          </div>
        </div>

        <div class="button-container">
          <pv-button class="submit-button">Agregar</pv-button>
          <pv-button class="back-button">Volver</pv-button>
        </div>
      </form>
    </div>
  </div>
</template>

<style scoped>
.workshop-form-container {
  max-width: 600px;
  margin: 0 auto;
  padding: 20px;
}
.p-cascadeselect{
  background-color: transparent;
  box-shadow: none ;
}

.p-textarea {
  background-color: transparent ;
  box-shadow: none ;
  color: rgba(255, 255, 255, 0);
}

.custom-d input.p-inputtext {
  background-color: #ffffff !important;
  color: #333 !important;
  border: 2px solid #fdb825 !important;
  border-radius: 10px !important;
  box-shadow: none !important;
}

.form-title {
  color: #1a4d6d;
  font-size: 32px;
  font-weight: bold;
  margin-bottom: 10px;
  border-bottom: 3px solid #1a4d6d;
  padding-bottom: 10px;
}

.form-card {
  background-color: #f5f5f5;
  border-radius: 8px;
  padding: 30px;
  margin-top: 20px;
}

.section-title {
  font-size: 18px;
  font-weight: 600;
  color: #333;
  margin-bottom: 25px;
}

.form-group {
  margin-bottom: 20px;
}

.form-label {
  display: block;
  font-size: 14px;
  font-weight: 500;
  color: #333;
  margin-bottom: 8px;
}

.full-width {
  width: 100%;
}

.date-time-row {
  display: flex;
  gap: 15px;
  margin-bottom: 20px;
}

.half-width {
  flex: 1;
}

.button-container {
  display: flex;
  justify-content: center;
  margin-top: 30px;
}

.submit-button {
  background-color: #fdb825 !important;
  color: #333 !important;
  font-weight: 600;
  padding: 10px 40px !important;
  border-radius: 25px !important;
  text-transform: none !important;
  font-size: 16px;
}

.submit-button:hover:not([disabled]) {
  background-color: #e5a620 !important;
}

.submit-button:disabled {
  opacity: 0.5;
}

.main-header {
  margin-bottom: 2rem;
}

.main-header h1 {
  font-size: 2.5rem;
  color: var(--color-primary);
  margin: 0;
  position: relative;
  padding-bottom: 1rem;
}

.main-header h1::after {
  content: '';
  position: absolute;
  bottom: 0;
  left: 0;
  width: 200px;
  height: 4px;
  background-color: var(--color-primary);
}
.back-button{
  background-color: white;
}
</style>