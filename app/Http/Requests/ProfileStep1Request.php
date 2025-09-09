<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;
use Carbon\Carbon;

class ProfileStep1Request extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        $minDate = Carbon::now()->subYears(80)->toDateString(); // oldest allowed
        $maxDate = Carbon::now()->subYears(16)->toDateString(); // youngest allowed

        return [
            'birth_date' => [
                'required',
                'date',
                "after_or_equal:{$minDate}",
                "before_or_equal:{$maxDate}",
            ],
            'phone' => 'required|string|max:20',
            'gender' => ['required', Rule::in(['male', 'female'])],
            'location' => 'required|string|max:255',
        ];
    }

    public function messages(): array
    {
        return [
            'birth_date.required' => 'Dzimšanas datums ir obligāts.',
            'birth_date.date' => 'Dzimšanas datumam jābūt derīgam datumam.',
            'birth_date.after_or_equal' => 'Vecumam jābūt ne vairāk kā 80 gadi.',
            'birth_date.before_or_equal' => 'Vecumam jābūt vismaz 16 gadiem.',
            'gender.required' => 'Dzimums ir obligāts.',
            'gender.in' => 'Dzimums nav derīgs.',
            'location.required' => 'Atrašanās vieta ir obligāta.',
            'phone.max' => 'Telefona numurs pārāk garš.',
        ];
    }
}
