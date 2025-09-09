<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class ProfileStep2Request extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'sports' => 'required|array|min:1',
            'sports.*.sport_id' => 'required|exists:sports,id',
            'sports.*.skill_level' => 'required|in:beginner,intermediate,advanced',
            'sports.*.is_preferred' => 'boolean',
        ];
    }

    public function messages(): array
    {
        return [
            'sports.required' => 'Jāizvēlas vismaz viens sports.',
            'sports.min' => 'Jāizvēlas vismaz viens sports.',
            'sports.*.sport_id.required' => 'Sports nav norādīts.',
            'sports.*.sport_id.exists' => 'Sporta veids neeksistē.',
            'sports.*.skill_level.required' => 'Prasmes līmenis ir obligāts.',
            'sports.*.skill_level.in' => 'Prasmes līmenis nav derīgs.',
        ];
    }
}

