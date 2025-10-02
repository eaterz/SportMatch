<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class City extends Model
{
    use HasFactory;

    protected $fillable = [
        'name',
        'region',
        'latitude',
        'longitude',
        'population'
    ];

    protected $casts = [
        'latitude' => 'decimal:8',
        'longitude' => 'decimal:8',
        'population' => 'integer'
    ];

    /**
     * Calculate distance to another city in kilometers
     */
    public function distanceTo(City $city): float
    {
        return $this->calculateDistance(
            $this->latitude,
            $this->longitude,
            $city->latitude,
            $city->longitude
        );
    }

    /**
     * Calculate distance between two coordinates using Haversine formula
     */
    public static function calculateDistance($lat1, $lon1, $lat2, $lon2): float
    {
        $earthRadius = 6371; // km

        $latDiff = deg2rad($lat2 - $lat1);
        $lonDiff = deg2rad($lon2 - $lon1);

        $a = sin($latDiff / 2) * sin($latDiff / 2) +
            cos(deg2rad($lat1)) * cos(deg2rad($lat2)) *
            sin($lonDiff / 2) * sin($lonDiff / 2);

        $c = 2 * atan2(sqrt($a), sqrt(1 - $a));

        return $earthRadius * $c;
    }

    /**
     * Scope to find cities within distance from coordinates
     */
    public function scopeWithinDistance($query, $latitude, $longitude, $distanceKm)
    {
        // Approximate degree to km conversion (at Latvia's latitude ~57°)
        $latDegree = 111.0; // km per degree of latitude
        $lonDegree = 61.0;  // km per degree of longitude at 57° latitude

        $latRange = $distanceKm / $latDegree;
        $lonRange = $distanceKm / $lonDegree;

        return $query->whereBetween('latitude', [$latitude - $latRange, $latitude + $latRange])
            ->whereBetween('longitude', [$longitude - $lonRange, $longitude + $lonRange]);
    }
}
