import { Directive, HostListener, inject } from '@angular/core';
import { Select } from 'primeng/select';

/**
 * Apply to a `p-select` that acts as an "add to a list" trigger — i.e. picking an option
 * appends it somewhere and the select itself should not retain a value.
 *
 * PrimeNG keeps the chosen option as the Select's internal model and skips emitting `onChange`
 * when the same value is selected again (`onOptionSelect` early-returns on `isSelected`). Because
 * these triggers bind a model that is reset to `null` — and `null → null` is not a change —
 * Angular never pushes the reset down to the Select, so it keeps the stale value and the *same*
 * item can't be picked twice in a row (the user has to detour via a different option first).
 *
 * After every selection this clears the Select directly via its public ControlValueAccessor
 * (`writeValue(null)`), which resets the internal model and — when a filter is active — the
 * search text too, so the same option is immediately selectable again.
 */
@Directive({
  selector: 'p-select[appActionSelect]',
  standalone: true,
})
export class ActionSelectDirective {
  private readonly select = inject(Select, { self: true });

  @HostListener('onChange')
  onChange(): void {
    // Defer so PrimeNG finishes its own select/hide handling before we reset it.
    queueMicrotask(() => this.select.writeValue(null));
  }
}
