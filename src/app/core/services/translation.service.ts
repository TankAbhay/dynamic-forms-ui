import { Injectable, signal, computed } from '@angular/core';

export type SupportedLanguage = 'en' | 'it';

export interface LanguageOption {
  code: SupportedLanguage;
  label: string;
  flag: string;
}

@Injectable({
  providedIn: 'root'
})
export class TranslationService {
  private readonly STORAGE_KEY = 'app_language_preference';

  readonly availableLanguages: LanguageOption[] = [
    { code: 'en', label: 'English', flag: '🇺🇸' },
    { code: 'it', label: 'Italiano', flag: '🇮🇹' }
  ];

  // Reactive signal tracking the current active language
  readonly currentLang = signal<SupportedLanguage>(this.getInitialLanguage());

  // Comprehensive multi-language dictionary
  private readonly translations: Record<SupportedLanguage, Record<string, unknown>> = {
    en: {
      common: {
        save: 'Save',
        saving: 'Saving...',
        saved: 'Saved',
        cancel: 'Cancel',
        delete: 'Delete',
        edit: 'Edit',
        back: 'Back',
        return: 'Return',
        submit: 'Submit',
        submitting: 'Submitting...',
        add: 'Add',
        close: 'Close',
        search: 'Search',
        filter: 'Filter',
        loading: 'Loading...',
        undo: 'Undo',
        redo: 'Redo',
        actions: 'Actions',
        status: 'Status',
        active: 'Active',
        inactive: 'Inactive',
        mandatory: 'Mandatory',
        optional: 'Optional',
        preview: 'Live Preview',
        builder: 'Form Builder',
        duplicate: 'Duplicate',
        required: 'Required',
        workspace: 'Workspace',
        language: 'Language',
        user: 'User',
        all: 'All',
        yes: 'Yes',
        no: 'No',
        confirm: 'Confirm'
      },
      nav: {
        dashboard: 'Dashboard',
        employees: 'Employees',
        hierarchy: 'Team Hierarchy',
        leave: 'Leave Management',
        forms: 'Custom Forms',
        training: 'Training Catalog',
        admin: 'Administration',
        profile: 'My Profile',
        logout: 'Sign Out',
        impersonating: 'ADMIN IMPERSONATION MODE ACTIVE',
        exitImpersonation: 'Exit & Return to Admin Account'
      },
      header: {
        appTitle: 'Employee Management System',
        selectLanguage: 'Select Language',
        switchWorkspace: 'Switch Company Workspace',
        profile: 'View My Profile',
        role: 'Role'
      },
      footer: {
        rights: 'All rights reserved',
        enterpriseEdition: 'Enterprise Edition v22.0',
        builtWith: 'Built with Angular'
      },
      dashboard: {
        heroTitle: 'Workforce & Operations Dashboard',
        heroSubtitle: 'Real-time organizational analytics, task progress tracking, and daily work log reviews.',
        enterpriseLive: 'Enterprise Hub Live',
        activeTasks: 'My Active Tasks',
        activeTasksSub: 'Tasks pending & in-progress',
        dueSoon: 'Tasks Due Soon',
        dueSoonSub: 'Due within 48 hours',
        hoursLogged: 'Hours Logged',
        hoursLoggedSub: 'Total daily work logs',
        teamSize: 'Team Size',
        teamSizeSub: 'Direct & indirect reports',
        totalHeadcount: 'Total Headcount',
        totalHeadcountSub: 'Total company workforce'
      },
      hierarchy: {
        title: 'Corporate Team Hierarchy',
        subtitle: 'Interactive organization structure with drag-and-drop team re-parenting',
        searchPlaceholder: 'Search by employee name or keywords...',
        filterCategory: 'Tier Category',
        filterLocation: 'Location',
        filterStatus: 'Status',
        resetFilters: 'Reset Filters',
        exportCsv: 'Export CSV',
        selectAllInTier: 'Select All in Tier',
        reportsTo: 'Reports To',
        emptyTier: 'No employees assigned to this tier yet.',
        dropCardHint: 'Drop card here to assign'
      },
      forms: {
        title: 'Custom Forms',
        subtitle: 'Build dynamic surveys, assessments, and onboarding checklists',
        createForm: 'Create New Form',
        editForm: 'Edit Form',
        builder: 'Builder',
        fillForm: 'Fill Form',
        notFound: 'Form Not Found',
        notFoundDesc: 'The requested form could not be loaded or may have been deleted.',
        returnToList: 'Return to Forms List',
        backToForms: 'Back to Forms',
        thankYou: 'Thank You!',
        responseRecorded: 'Your response has been recorded successfully.',
        submitAnother: 'Submit Another Response',
        referenceNumber: 'Reference',
        formDetails: 'Form Details',
        formTitlePlaceholder: 'e.g. Employee Satisfaction Survey',
        formDescPlaceholder: 'Describe the purpose or instructions for this form...',
        category: 'Category',
        statusActive: 'Active & Accepting Submissions',
        statusInactive: 'Draft / Inactive',
        componentPalette: 'Component Palette',
        paletteSubtitle: 'Click or drag elements onto the canvas',
        fieldInspector: 'Field Inspector',
        inspectorSubtitle: 'Configure selected field properties',
        noFieldSelected: 'No Field Selected',
        clickFieldToEdit: 'Click any field on the canvas to customize its label, placeholder, and validations.',
        canvasEmptyTitle: 'No fields added yet',
        canvasEmptySubtitle: 'Click components on the left palette to start building your custom form.',
        unsavedBadge: 'Unsaved Changes',
        savedSuccess: 'Form saved successfully!',
        fieldAddedToast: 'Added {{type}} field to form',
        submissionsCount: 'Submissions',
        totalFields: 'Fields',
        previewNotice: 'Live Interactive Preview Mode - responses here will not be recorded in database.',
        resetPreview: 'Reset Preview Form',
        fillAllRequired: 'Please complete all required fields highlighted above.',
        submitResponse: 'Submit Response',
        palette: {
          heading: 'Section Heading',
          headingDesc: 'Title header or divider',
          paragraph: 'Description Text',
          paragraphDesc: 'Static informational guidance',
          text: 'Text Box',
          textDesc: 'Single-line text input',
          textarea: 'Text Area',
          textareaDesc: 'Multi-line detailed response',
          number: 'Number Input',
          numberDesc: 'Numeric quantities or amounts',
          select: 'Dropdown Select',
          selectDesc: 'Choose one option from a list',
          radio: 'Radio Choices',
          radioDesc: 'Single-choice radio buttons',
          checkbox: 'Checkbox',
          checkboxDesc: 'Yes/No acknowledgment or toggle',
          date: 'Date Picker',
          dateDesc: 'Select calendar date',
          email: 'Email Address',
          emailDesc: 'Email formatted input'
        }
      }
    },
    it: {
      common: {
        save: 'Salva',
        saving: 'Salvataggio in corso...',
        saved: 'Salvato',
        cancel: 'Annulla',
        delete: 'Elimina',
        edit: 'Modifica',
        back: 'Indietro',
        return: 'Ritorna',
        submit: 'Invia',
        submitting: 'Invio in corso...',
        add: 'Aggiungi',
        close: 'Chiudi',
        search: 'Cerca',
        filter: 'Filtra',
        loading: 'Caricamento in corso...',
        undo: 'Annulla',
        redo: 'Ripeti',
        actions: 'Azioni',
        status: 'Stato',
        active: 'Attivo',
        inactive: 'Inattivo',
        mandatory: 'Obbligatorio',
        optional: 'Opzionale',
        preview: 'Anteprima Live',
        builder: 'Costruttore Modulo',
        duplicate: 'Duplica',
        required: 'Richiesto',
        workspace: 'Spazio di lavoro',
        language: 'Lingua',
        user: 'Utente',
        all: 'Tutti',
        yes: 'Sì',
        no: 'No',
        confirm: 'Conferma'
      },
      nav: {
        dashboard: 'Cruscotto',
        employees: 'Dipendenti',
        hierarchy: 'Gerarchia del Team',
        leave: 'Gestione Permessi',
        forms: 'Moduli Personalizzati',
        training: 'Catalogo Formazione',
        admin: 'Amministrazione',
        profile: 'Il Mio Profilo',
        logout: 'Disconnetti',
        impersonating: 'MODALITÀ IMPERSONIFICAZIONE AMMINISTRATORE ATTIVA',
        exitImpersonation: "Esci e Torna all'Account Amministratore"
      },
      header: {
        appTitle: 'Sistema di Gestione Dipendenti',
        selectLanguage: 'Seleziona Lingua',
        switchWorkspace: 'Cambia Spazio Aziendale',
        profile: 'Visualizza Profilo',
        role: 'Ruolo'
      },
      footer: {
        rights: 'Tutti i diritti riservati',
        enterpriseEdition: 'Edizione Enterprise v22.0',
        builtWith: 'Alimentato da Angular'
      },
      dashboard: {
        heroTitle: 'Cruscotto Operazioni e Personale',
        heroSubtitle: 'Analisi organizzativa in tempo reale, avanzamento attività e registri giornalieri.',
        enterpriseLive: 'Hub Enterprise Attivo',
        activeTasks: 'Le Mie Attività',
        activeTasksSub: 'Attività in sospeso e in corso',
        dueSoon: 'Attività in Scadenza',
        dueSoonSub: 'Scadenza entro 48 ore',
        hoursLogged: 'Ore Registrate',
        hoursLoggedSub: 'Totale ore lavorate giornaliere',
        teamSize: 'Dimensione Team',
        teamSizeSub: 'Collaboratori diretti e indiretti',
        totalHeadcount: 'Organico Totale',
        totalHeadcountSub: 'Totale dipendenti aziendali'
      },
      hierarchy: {
        title: 'Gerarchia Aziendale del Team',
        subtitle: 'Struttura organizzativa interattiva con riassegnazione manageriale tramite drag & drop',
        searchPlaceholder: 'Cerca per nome dipendente o parola chiave...',
        filterCategory: 'Categoria Livello',
        filterLocation: 'Sede',
        filterStatus: 'Stato',
        resetFilters: 'Reimposta Filtri',
        exportCsv: 'Esporta CSV',
        selectAllInTier: 'Seleziona Tutti nel Livello',
        reportsTo: 'Riferisce A',
        emptyTier: 'Nessun dipendente assegnato a questo livello.',
        dropCardHint: 'Trascina scheda qui per assegnare'
      },
      forms: {
        title: 'Moduli Personalizzati',
        subtitle: 'Crea sondaggi dinamici, valutazioni e checklist di onboarding',
        createForm: 'Crea Nuovo Modulo',
        editForm: 'Modifica Modulo',
        builder: 'Builder',
        fillForm: 'Compila Modulo',
        notFound: 'Modulo Non Trovato',
        notFoundDesc: 'Il modulo richiesto non è stato trovato o potrebbe essere stato eliminato.',
        returnToList: "Torna all'Elenco Moduli",
        backToForms: 'Torna ai Moduli',
        thankYou: 'Grazie!',
        responseRecorded: 'La tua risposta è stata registrata con successo.',
        submitAnother: "Invia un'Altra Risposta",
        referenceNumber: 'Riferimento',
        formDetails: 'Dettagli del Modulo',
        formTitlePlaceholder: 'es. Sondaggio Soddisfazione Dipendenti',
        formDescPlaceholder: 'Descrivi lo scopo o le istruzioni per questo modulo...',
        category: 'Categoria',
        statusActive: 'Attivo e aperto alle risposte',
        statusInactive: 'Bozza / Non Attivo',
        componentPalette: 'Tavolozza Componenti',
        paletteSubtitle: "Fai clic o trascina gli elementi sull'area di lavoro",
        fieldInspector: 'Ispettore Campo',
        inspectorSubtitle: 'Configura le proprietà del campo selezionato',
        noFieldSelected: 'Nessun Campo Selezionato',
        clickFieldToEdit: "Fai clic su un campo nell'area di lavoro per personalizzare etichetta, segnaposto e convalide.",
        canvasEmptyTitle: 'Nessun campo ancora aggiunto',
        canvasEmptySubtitle: 'Fai clic sui componenti nella tavolozza a sinistra per iniziare a costruire il modulo.',
        unsavedBadge: 'Modifiche non salvate',
        savedSuccess: 'Modulo salvato con successo!',
        fieldAddedToast: 'Aggiunto campo {{type}} al modulo',
        submissionsCount: 'Risposte',
        totalFields: 'Campi',
        previewNotice: 'Modalità Anteprima Live Interattiva - le risposte qui non verranno registrate nel database.',
        resetPreview: 'Reimposta Anteprima',
        fillAllRequired: 'Si prega di completare tutti i campi obbligatori evidenziati sopra.',
        submitResponse: 'Invia Risposta',
        palette: {
          heading: 'Intestazione Sezione',
          headingDesc: 'Intestazione titolo o divisore',
          paragraph: 'Testo Descrittivo',
          paragraphDesc: 'Guida o testo informativo statico',
          text: 'Casella di Testo',
          textDesc: 'Input testo a riga singola',
          textarea: 'Area di Testo',
          textareaDesc: 'Risposta dettagliata multilinea',
          number: 'Input Numerico',
          numberDesc: 'Quantità o importi numerici',
          select: 'Menu a Tendina',
          selectDesc: "Scegli un'opzione da un elenco",
          radio: 'Scelta Singola',
          radioDesc: 'Pulsanti radio a selezione singola',
          checkbox: 'Casella di Controllo',
          checkboxDesc: 'Conferma o interruttore Sì/No',
          date: 'Selettore Data',
          dateDesc: 'Seleziona data dal calendario',
          email: 'Indirizzo Email',
          emailDesc: 'Input formattato per email'
        }
      }
    }
  };

  constructor() {}

  /**
   * Translates a key path (e.g. 'forms.notFound' or 'common.save') with optional interpolation and fallback.
   */
  t(key: string, params?: Record<string, string | number>, fallback?: string): string {
    const lang = this.currentLang();
    const translationTree = (this.translations[lang] || this.translations.en) as Record<string, unknown>;
    
    let value = this.resolvePath(translationTree, key);
    
    // Fallback to English if translation missing in Italian
    if (value === undefined && lang !== 'en') {
      value = this.resolvePath(this.translations.en as Record<string, unknown>, key);
    }
    
    if (value === undefined) {
      return fallback !== undefined ? fallback : key;
    }

    if (typeof value !== 'string') {
      return String(value);
    }

    // Parameter interpolation: {{key}}
    if (params) {
      Object.keys(params).forEach(param => {
        value = (value as string).replace(new RegExp(`{{\\s*${param}\\s*}}`, 'g'), String(params[param]));
      });
    }

    return value;
  }

  /**
   * Set active language and persist in localStorage
   */
  setLanguage(lang: SupportedLanguage): void {
    this.currentLang.set(lang);
    try {
      localStorage.setItem(this.STORAGE_KEY, lang);
    } catch {
      // Ignore localStorage errors in private mode
    }
  }

  /**
   * Toggle between EN and IT
   */
  toggleLanguage(): void {
    const next = this.currentLang() === 'en' ? 'it' : 'en';
    this.setLanguage(next);
  }

  private getInitialLanguage(): SupportedLanguage {
    try {
      const saved = localStorage.getItem(this.STORAGE_KEY) as SupportedLanguage;
      if (saved && (saved === 'en' || saved === 'it')) {
        return saved;
      }
      // Browser language check
      if (typeof navigator !== 'undefined' && navigator.language?.startsWith('it')) {
        return 'it';
      }
    } catch {
      // Fallback
    }
    return 'en';
  }

  private resolvePath(obj: Record<string, unknown>, path: string): unknown {
    return path.split('.').reduce<unknown>((prev, curr) => {
      if (prev && typeof prev === 'object' && curr in prev) {
        return (prev as Record<string, unknown>)[curr];
      }
      return undefined;
    }, obj);
  }
}
