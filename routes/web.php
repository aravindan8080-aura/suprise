<?php

use App\Http\Controllers\BirthdayController;
use Illuminate\Support\Facades\Route;

Route::redirect('/', '/birthday');

Route::prefix('birthday')->name('birthday.')->group(function () {
    Route::get('/', [BirthdayController::class, 'index'])->name('index');
    Route::get('/friend', [BirthdayController::class, 'friend'])->name('friend');
    Route::get('/propose', [BirthdayController::class, 'propose'])->name('propose');
});
