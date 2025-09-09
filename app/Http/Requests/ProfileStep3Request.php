<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class ProfileStep3Request extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'schedule' => 'nullable|array',
            'schedule.*.day' => 'required|in:monday,tuesday,wednesday,thursday,friday,saturday,sunday',
            'schedule.*.start_time' => 'required|date_format:H:i',
            'schedule.*.end_time' => 'required|date_format:H:i|after:schedule.*.start_time',
        ];
    }

    public function messages(): array
    {
        return [
            'schedule.*.day.required' => 'Diena ir obligāta.',
            'schedule.*.day.in' => 'Nederīga diena.',
            'schedule.*.start_time.required' => 'Sākuma laiks ir obligāts.',
            'schedule.*.start_time.date_format' => 'Nederīgs laika formāts.',
            'schedule.*.end_time.required' => 'Beigu laiks ir obligāts.',
            'schedule.*.end_time.date_format' => 'Nederīgs laika formāts.',
            'schedule.*.end_time.after' => 'Beigu laikam jābūt pēc sākuma laika.',
        ];
    }

    protected function prepareForValidation()
    {
        // Pārvērš schedule data pareizā formātā
        if ($this->has('schedule')) {
            $schedule = [];
            foreach ($this->input('schedule') as $dayKey => $dayData) {
                if (isset($dayData['day']) && isset($dayData['start_time']) && isset($dayData['end_time'])) {
                    $schedule[] = [
                        'day' => $dayData['day'],
                        'start_time' => $dayData['start_time'],
                        'end_time' => $dayData['end_time'],
                    ];
                }
            }
            $this->merge(['schedule' => $schedule]);
        }
    }
}

