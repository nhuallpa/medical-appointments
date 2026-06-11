import { test, expect, type Page } from "@playwright/test";

interface LocaleStrings {
  combobox: string;
  dayTab: string;
  previousDay: string;
  nextDay: string;
  goToToday: string;
  addAppointmentAt: RegExp;
  patientNameLabel: RegExp;
  professionalNameLabel: RegExp;
  saveButton: RegExp;
  patientNameRequired: string;
  appointmentDetailTitle: string;
  patientField: string;
  professionalField: string;
  closeButton: string;
  appointmentTypesTitle: string;
  scheduleConfigTitle: string;
  addNewType: string;
  saveConfiguration: string;
}

const LOCALES: Record<"es" | "pt", LocaleStrings> = {
  es: {
    combobox: "es",
    dayTab: "Día",
    previousDay: "Día anterior",
    nextDay: "Día siguiente",
    goToToday: "Ir a hoy",
    addAppointmentAt: /agregar turno a las/i,
    patientNameLabel: /nombre del paciente/i,
    professionalNameLabel: /nombre del profesional/i,
    saveButton: /guardar/i,
    patientNameRequired: "El nombre del paciente es obligatorio",
    appointmentDetailTitle: "Detalles del Turno",
    patientField: "Paciente",
    professionalField: "Profesional",
    closeButton: "Cerrar",
    appointmentTypesTitle: "Tipos de Turno",
    scheduleConfigTitle: "Configuración de Horario",
    addNewType: "Agregar Nuevo Tipo",
    saveConfiguration: "Guardar Configuración",
  },
  pt: {
    combobox: "pt",
    dayTab: "Dia",
    previousDay: "Dia anterior",
    nextDay: "Próximo dia",
    goToToday: "Ir para hoje",
    addAppointmentAt: /adicionar consulta às/i,
    patientNameLabel: /nome do paciente/i,
    professionalNameLabel: /nome do profissional/i,
    saveButton: /salvar/i,
    patientNameRequired: "O nome do paciente é obrigatório",
    appointmentDetailTitle: "Detalhes da Consulta",
    patientField: "Paciente",
    professionalField: "Profissional",
    closeButton: "Fechar",
    appointmentTypesTitle: "Tipos de Consulta",
    scheduleConfigTitle: "Configuração de Horário",
    addNewType: "Adicionar Novo Tipo",
    saveConfiguration: "Salvar Configuração",
  },
};

async function switchLanguage(page: Page, code: string): Promise<void> {
  await page.getByRole("combobox", { name: /language|idioma/i }).selectOption(code);
}

for (const [code, strings] of Object.entries(LOCALES) as [keyof typeof LOCALES, LocaleStrings][]) {
  test.describe(`US3 — Full coverage in ${code}`, () => {
    test(`Day view, appointment form, detail, and settings are translated (${code})`, async ({
      page,
    }) => {
      await page.goto("/");
      await switchLanguage(page, strings.combobox);

      // Day view
      await page.getByRole("tab", { name: strings.dayTab }).click();
      await expect(page.getByRole("button", { name: strings.previousDay })).toBeVisible();
      await expect(page.getByRole("button", { name: strings.nextDay })).toBeVisible();
      await expect(page.getByRole("button", { name: strings.goToToday })).toBeVisible();

      // Open appointment form from a day-view slot
      await page.getByRole("button", { name: strings.addAppointmentAt }).first().click();
      await expect(page.getByRole("dialog")).toBeVisible();
      await expect(page.getByLabel(strings.patientNameLabel)).toBeVisible();
      await expect(page.getByLabel(strings.professionalNameLabel)).toBeVisible();

      // Validation error is translated
      await page.getByRole("button", { name: strings.saveButton }).click();
      await expect(page.getByText(strings.patientNameRequired)).toBeVisible();

      // Fill and save the appointment
      await page.getByLabel(strings.patientNameLabel).fill("Test Patient");
      await page.getByLabel(strings.professionalNameLabel).fill("Test Professional");
      await page.getByRole("button", { name: strings.saveButton }).click();
      await expect(page.getByRole("dialog")).not.toBeVisible();

      // Open appointment detail
      await page.getByText("Test Patient").click();
      await expect(page.getByText(strings.appointmentDetailTitle)).toBeVisible();
      await expect(page.getByText(strings.patientField)).toBeVisible();
      await expect(page.getByText(strings.professionalField)).toBeVisible();
      await page.getByRole("button", { name: strings.closeButton }).click();
      await expect(page.getByRole("dialog")).not.toBeVisible();

      // Settings page
      await page.getByRole("link", { name: /settings|configuración|configurações/i }).click();
      await expect(page.getByText(strings.appointmentTypesTitle)).toBeVisible();
      await expect(page.getByText(strings.scheduleConfigTitle)).toBeVisible();
      await expect(page.getByText(strings.addNewType)).toBeVisible();
      await expect(page.getByRole("button", { name: strings.saveConfiguration })).toBeVisible();
    });
  });
}
