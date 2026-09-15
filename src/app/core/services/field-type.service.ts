import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { environment } from '../../../environments/environment';
import {
  FormPaletteConfigItem,
  CreateFieldTypePayload,
  UpdateFieldTypePayload
} from '../models/form.model';
import { AdminOperationResult } from '../models/admin.model';

@Injectable({
  providedIn: 'root'
})
export class FieldTypeService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = `${environment.apiUrl}/fieldtypes`;

  private mapItem(item: any): FormPaletteConfigItem {
    return {
      id: item.id,
      type: item.fieldTypeCode || item.type,
      fieldTypeCode: item.fieldTypeCode || item.type,
      label: item.label,
      labelKey: item.labelKey,
      icon: item.icon,
      description: item.description || '',
      descKey: item.descKey,
      defaultLabel: item.defaultLabel || item.label,
      defaultPlaceholder: item.defaultPlaceholder || '',
      hasOptions: !!item.hasOptions,
      category: item.category || 'Input',
      sortOrder: item.sortOrder || 0,
      isActive: item.isActive !== false,
      isSystem: !!item.isSystem
    };
  }

  /**
   * Retrieves all active field types for the Form Builder component palette.
   */
  getActivePalette(): Observable<FormPaletteConfigItem[]> {
    return this.http.get<any[]>(this.baseUrl).pipe(
      map(items => (items || []).map(i => this.mapItem(i)))
    );
  }

  /**
   * Master Page: Retrieves all field types (active and inactive) for management.
   */
  getAllFieldTypes(): Observable<FormPaletteConfigItem[]> {
    return this.http.get<any[]>(`${this.baseUrl}/all`).pipe(
      map(items => (items || []).map(i => this.mapItem(i)))
    );
  }

  /**
   * Master Page: Retrieves a specific field type by ID.
   */
  getFieldTypeById(id: number): Observable<FormPaletteConfigItem> {
    return this.http.get<any>(`${this.baseUrl}/${id}`).pipe(
      map(i => this.mapItem(i))
    );
  }

  /**
   * Master Page: Creates a new custom field type.
   */
  createFieldType(payload: CreateFieldTypePayload): Observable<FormPaletteConfigItem> {
    const code = (payload.type || payload.fieldTypeCode || '').trim();
    const body = {
      type: code,
      fieldTypeCode: code,
      label: payload.label,
      labelKey: payload.labelKey,
      icon: payload.icon,
      description: payload.description,
      descKey: payload.descKey,
      defaultLabel: payload.defaultLabel || payload.label,
      defaultPlaceholder: payload.defaultPlaceholder,
      hasOptions: payload.hasOptions,
      category: payload.category || 'Input',
      sortOrder: payload.sortOrder || 10,
      isActive: payload.isActive !== false
    };
    return this.http.post<any>(this.baseUrl, body).pipe(
      map(i => this.mapItem(i))
    );
  }

  /**
   * Master Page: Updates an existing field type definition.
   */
  updateFieldType(id: number, payload: UpdateFieldTypePayload): Observable<FormPaletteConfigItem> {
    return this.http.put<any>(`${this.baseUrl}/${id}`, payload).pipe(
      map(i => this.mapItem(i))
    );
  }

  /**
   * Master Page: Toggles the active status of a field type.
   */
  toggleActive(id: number): Observable<FormPaletteConfigItem> {
    return this.http.patch<any>(`${this.baseUrl}/${id}/toggle`, {}).pipe(
      map(i => this.mapItem(i))
    );
  }

  toggleStatus(id: number): Observable<FormPaletteConfigItem> {
    return this.toggleActive(id);
  }

  /**
   * Master Page: Deletes a custom field type.
   */
  deleteFieldType(id: number): Observable<AdminOperationResult> {
    return this.http.delete<AdminOperationResult>(`${this.baseUrl}/${id}`);
  }
}
